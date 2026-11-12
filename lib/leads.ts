/* ───────────────────────────────────────────────────────────────────────────
   LEADS

   What the enquiry forms and app/api/leads share. The forms post here and the
   route sends the mail (server/services/mail.service.ts), so the SMTP password
   stays on the server and nothing about the mail account reaches the bundle
   except the one yes or no below.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Whether the forms can send, from next.config.ts: true when the build could see
 * SMTP_USER and SMTP_PASS.
 *
 * A build with no mail account shows the email address instead of a form that
 * fails on submit. A dead form is worse than no form, because the visitor
 * believes they have made contact and stops trying.
 */
export const leadsReady = process.env.NEXT_PUBLIC_LEADS_READY === "true";

/**
 * The address check, for the input's `pattern` and for the route alike, so the
 * route can never refuse an address the form let through.
 *
 * Stricter than type="email", which passes name@gmail. That is a typo worth
 * catching while the visitor is still there, and an address with no way to
 * reply to. It leaves out quotes, commas and angle brackets as well: this
 * address becomes a mail recipient.
 */
export const EMAIL_PATTERN = "[A-Za-z0-9_'+\\-.]*[A-Za-z0-9_+\\-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}";

/**
 * The spam trap's field, in both forms and in the route.
 *
 * It used to be `website`, a name that a browser's autofill and an agent filling
 * in every field would both take for a real question, and either one lost a real
 * enquiry to the trap. This name says what to do with it. A bot that fills
 * everything still fills it.
 */
export const TRAP_FIELD = "hp_leave_blank";

/**
 * The forms' ref. `novalidate` is set here and not written in the HTML: until the
 * script is there to check the fields, the browser's own checks are all a form
 * has, and they stop a bad post before it loses what the visitor typed. React never
 * touches this property again, as no prop names it.
 */
export function scriptValidates(form: HTMLFormElement | null) {
  if (form) form.noValidate = true;
}

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  /** The service asked about. */
  service: string;
  /** The package picked, on a landing page. */
  interest?: string;
  message?: string;
  /**
   * Which form: "enquiry_form", or "landing:<slug> (<form on the page>)". With
   * no script running: "form", or "landing:<slug> (<form on the page>, plain post)".
   * "webmcp" from the agent tool, and "api" from a caller who gave none. The
   * agent tool's "webmcp" is also its form name and lead source in the
   * dataLayer (lib/analytics.ts), so the inbox and the reports tell its leads
   * apart by the same word.
   */
  source: string;
  /**
   * Host, path and query string, so a tagged ad link says which campaign paid.
   * The route takes it from the Referer if the caller gave none, or says "unknown".
   */
  page: string;
}

/** Resolves when the team's mail has gone. Rejects on anything else. */
export async function sendLead(lead: Omit<Lead, "page">): Promise<void> {
  const { host, pathname, search } = window.location;
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, page: `${host}${pathname}${search}` }),
  });
  if (!response.ok) throw new Error(`POST /api/leads answered ${response.status}`);
}

/* ── WebMCP's form attributes ─────────────────────────────────────────────────
   Chrome's WebMCP trial can build an agent's tool out of a plain form, from
   these attributes on the form and its fields. The published spec does not
   define them yet, so the names may change, and this is the one place they are
   spelled. React passes unknown lowercase attributes through to the HTML.

   The spec's registerTool() refuses a name already in use, so only one form on a
   page carries a tool's name, and it differs from the imperative tool
   `send_enquiry`. There is no `toolautosubmit`, on purpose: a person presses the
   button on every enquiry a form sends.

   So a form an agent filled is still that form's lead: its own source in the
   mail, then /thank-you and the conversion, like any other. Only `send_enquiry`
   is marked "webmcp", in the mail and in the dataLayer
   (components/zan/webmcp/tools.ts). */

/** What an agent is told after a person pressed the button on a form it filled. */
export interface AgentReply {
  status: "sending" | "not_sent";
  note: string;
  errors?: Partial<Record<string, string>>;
}

export const AGENT_REPLY: {
  sending: AgentReply;
  invalid: (errors: Partial<Record<string, string>>) => AgentReply;
} = {
  /* Given as the send starts, not when it ends. The form disables its fields
     while it sends, Chrome reads that as a new definition of the tool, and it
     cancels a call that is still waiting. */
  sending: {
    status: "sending",
    note: "The person pressed the button and the page is sending the enquiry. The page shows whether it went, and the team replies within 24 hours. Do not send it again with send_enquiry.",
  },
  invalid: (errors) => ({
    status: "not_sent",
    errors,
    note: "Nothing was sent. Correct what is named, and check with the person before they press the button again.",
  }),
};

/**
 * When an agent filled the form through its tool (formTool below) and a person
 * then pressed the button, Chrome marks the submit event, and the agent's call
 * waits for what respondWith is given. That has to be asked for during the
 * event, before the handler's first await, and answered before the fields
 * change (AGENT_REPLY). Without it, the preventDefault every script-run send
 * needs makes Chrome fail the agent's call, even when the enquiry is sent. Like
 * the attributes, this is not in the published spec.
 *
 * Returns how to give the agent its answer, or null for an ordinary press.
 */
export function agentSubmit(event: Event): ((reply: AgentReply) => void) | null {
  const submit = event as Event & { agentInvoked?: boolean; respondWith?: (result: Promise<string>) => void };
  if (submit.agentInvoked !== true || typeof submit.respondWith !== "function") return null;
  let answer: (text: string) => void = () => {};
  try {
    submit.respondWith(
      new Promise<string>((resolve) => {
        answer = resolve;
      }),
    );
  } catch {
    return null;
  }
  // As JSON text, the form of answer this Chrome was seen to pass on.
  return (reply) => answer(JSON.stringify(reply));
}

export function formTool(toolname: string, tooldescription: string) {
  return { toolname, tooldescription };
}

export function toolParam(toolparamdescription: string) {
  return { toolparamdescription };
}

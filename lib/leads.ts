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

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  /** The service asked about. */
  service: string;
  /** The package picked, on a landing page. */
  interest?: string;
  message?: string;
  /** Which form: "enquiry_form", or "landing:<slug> (<form on the page>)". */
  source: string;
  /** Host, path and query string, so a tagged ad link says which campaign paid. */
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

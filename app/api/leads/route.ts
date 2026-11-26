import { z } from "zod";
import { site } from "@/constants/zan";
import { EMAIL_PATTERN, TRAP_FIELD, type Lead } from "@/lib/leads";
import { isUaePhone, nationalDigits, toDisplay } from "@/lib/uaePhone";
import { logger } from "@/server/config/logger";
import {
  fail,
  forbidden,
  isFormPost,
  isJsonPost,
  methodNotAllowed,
  ok,
  parseBody,
  plainText,
  readFormFields,
  route,
  sanitiseMessage,
  seeOther,
  tooMany,
} from "@/server/lib/http";
import { fromAnotherSite, httpUrl, ownReferer } from "@/server/lib/origin";
import { phoneForWorkspace } from "@/server/lib/phone";
import { clientIp, rateLimitWithin as limit } from "@/server/lib/rateLimit";
import { sendLeadConfirmation, sendLeadNotification } from "@/server/services/mail.service";
import { captureToWorkspace, type LeadFormId, type LeadRecord } from "@/server/services/workspace.service";

/** Nodemailer needs node:net and node:tls, and Mongoose the Node runtime. */
export const runtime = "nodejs";
export const maxDuration = 60;

/** One line, cut rather than refused: a long ad link must not cost the lead. */
const line = (max: number) => z.string().transform((v) => sanitiseMessage(v, max).replace(/\s+/g, " "));

const pageLine = line(500);

const bodySchema = z.object({
  name: line(80).refine(Boolean),
  email: z.string().trim().max(160).regex(new RegExp(`^${EMAIL_PATTERN}$`), "Enter a valid email address"),
  /** Required on every lead form of both sites: every lead in zan-workspace has a phone. */
  phone: line(32).refine(Boolean, "We need a phone number to reach you."),
  service: line(120).refine(Boolean),
  interest: line(120).optional(),
  message: z.string().transform((v) => sanitiseMessage(v, 5000)).optional(),
  source: line(80).optional(),
  /** zan-workspace's name for the form, when the form can say (lib/leads.ts). */
  form: z.enum(["contact_form", "contact_modal"]).optional(),
  page: pageLine.optional(),
});

/* ── A plain form post ───────────────────────────────────────────────────── */

/** Where a refused plain post lands when no page of this site sent it. */
const FORM_PAGE = "/contact-us";
const INVALID = "form=invalid";

const TOO_MANY = `Too many enquiries right now. Please try again in a few minutes, or email us directly at ${site.email}.`;
const NOT_SENT = `That did not send. Please go back and try again, or email us directly at ${site.email}.`;

/**
 * Back to the page that sent a refused post: only ever its path and query string,
 * only when the Referer names this site, and only a path that stays on this site
 * once it is a Location (ownReferer). Nothing in the body is read for this.
 * Anything else goes to the contact page.
 */
function backToForm(request: Request): Response {
  const from = ownReferer(request);
  if (!from) return seeOther(`${FORM_PAGE}?${INVALID}`);
  from.searchParams.set("form", "invalid");
  return seeOther(`${from.pathname}?${from.searchParams}`);
}

/** In the shape the forms' script sends: host, path and query string. */
function pageFromReferer(request: Request): string {
  const from = httpUrl(request.headers.get("referer"));
  return from ? pageLine.parse(`${from.host}${from.pathname}${from.search}`) : "unknown";
}

/**
 * The form, in the names zan-workspace uses for every site's forms
 * (LeadFormId), from the source this route already has. The enquiry form
 * says itself whether it was the contact popup.
 */
function formOf(lead: Lead): LeadFormId {
  if (lead.form) return lead.form;
  if (lead.source === "enquiry_form" || lead.source === "form") return "contact_form";
  if (lead.source.startsWith("landing:")) return "landing_page_form";
  if (lead.source === "webmcp") return "webmcp";
  return "api";
}

/** The lead as zan-workspace takes it (server/services/workspace.service.ts). */
function workspaceRecord(lead: Lead): LeadRecord {
  return {
    region: site.region,
    form: formOf(lead),
    page: lead.page === "unknown" ? null : lead.page,
    name: lead.name,
    email: lead.email.toLowerCase(),
    phone: phoneForWorkspace(lead.phone, site.region),
    service: lead.service || null,
    interest: lead.interest || null,
    message: lead.message || null,
    chat: null,
  };
}

/**
 * A landing page's field holds the national number, with the +971 fixed beside it
 * on the page. The form's script writes it out in full before it posts, so with no
 * script that happens here. A number that is not a UAE one stays as typed: it is
 * still a lead, and it still has an address to reply to.
 */
function landingPhone(phone: string): string {
  const national = nationalDigits(phone);
  return isUaePhone(national) ? toDisplay(national) : phone;
}

/**
 * POST /api/leads
 *
 * The enquiry forms, on the site and the landing pages. Open to anyone, and it
 * mails an address the caller chooses, so it has three limits:
 *
 *   Per caller       5 in 10 minutes. Enough for a person, not for a script.
 *   Site-wide        40 an hour. Each lead is two mails and Google Workspace
 *                    allows an account 2,000 a day, so a flood stops here and
 *                    not by locking the sales mailbox out of Gmail.
 *   Per address      3 confirmations an hour, so nobody's inbox can be filled
 *                    from this form by changing IP. The lead itself still goes.
 *
 * They count in Mongo and fail open: a Mongo outage slows a lead, but cannot
 * refuse it.
 *
 * WHERE A LEAD GOES, in this order:
 *   1. zan-workspace's /api/integrations/leads, the CRM, as every site's
 *      leads do (server/services/workspace.service.ts has the contract).
 *   2. The team's mail.
 *   3. A confirmation to the visitor.
 * The second is sent whatever happened to the first. Either one landing means
 * the lead reached us, so the visitor is told of a failure only when both
 * fail. zanservices has a route of the same name that does step 1 for its
 * forms, and sends its mail from the browser.
 *
 * TWO WAYS IN. The forms' script posts JSON and reads JSON back. With no script
 * running (JavaScript off, a script that failed, a press before hydration, a simple
 * agent) the browser posts the form itself, and the answer has to be somewhere to
 * land: 303 to /thank-you once the lead has gone, or 303 back to the page with
 * ?form=invalid. `source` and `page` are optional either way, and fall back to a
 * source of its own and to the Referer.
 *
 * THE TRAP. A plain post with the trap field filled gets the same 303 to /thank-you
 * as a real send, with nothing sent, so a bot learns nothing about why nothing
 * arrived. The script checks it in the browser and never posts it.
 *
 * WHAT ANOTHER SITE'S PAGE CAN DO. Any page can point a form at this address and
 * submit it from its visitor's browser, and nothing asks permission first. There
 * is no session here to ride on. What that could do is mail an address of its
 * choosing from the visitor's IP, past the per-caller limit, until the site-wide
 * limit shuts out real visitors; and send someone wherever it liked, if a redirect
 * followed a value it controls. So such a post is refused before anything else,
 * with nothing sent and no limit used, and a redirect goes only to /thank-you or
 * to a checked path on this site. application/json is exempt because it cannot get
 * here that way: a browser asks first with OPTIONS, and the answer below gives no
 * permission. That also means the forms' script never meets this check.
 */
export const POST = route(async (request: Request) => {
  const plain = isFormPost(request);

  if (!isJsonPost(request) && fromAnotherSite(request)) {
    logger.warn({ origin: request.headers.get("origin") }, "leads: refused a post from another site");
    return plain ? seeOther(`${FORM_PAGE}?${INVALID}`) : forbidden();
  }

  const refuseTooMany = (retryAfterSeconds: number) =>
    plain ? plainText(429, TOO_MANY, { "Retry-After": String(retryAfterSeconds) }) : tooMany(retryAfterSeconds);

  const ip = clientIp(request);
  if (ip) {
    const caller = await limit(ip, "lead", 5, 600);
    if (!caller.allowed) return refuseTooMany(caller.retryAfterSeconds);
  }

  let body: z.infer<typeof bodySchema>;
  if (plain) {
    const fields = await readFormFields(request);
    // Before the schema, so a bot's bad fields cannot tell it apart from a send.
    if (fields[TRAP_FIELD]?.trim()) {
      logger.info({}, "leads: trap field filled, nothing sent");
      return seeOther("/thank-you");
    }
    const parsed = bodySchema.safeParse(fields);
    if (!parsed.success) return backToForm(request);
    body = parsed.data;
  } else {
    const parsed = await parseBody(request, bodySchema);
    if (!parsed.ok) return parsed.response;
    body = parsed.data;
  }

  const source = body.source || (plain ? "form" : "api");
  const lead: Lead = {
    ...body,
    source,
    page: body.page || pageFromReferer(request),
    phone: plain && source.startsWith("landing:") ? landingPhone(body.phone) : body.phone,
  };

  // Only now, so a caller already refused above, or sending junk, cannot use up
  // the site's allowance and shut real visitors out.
  const everyone = await limit("site", "lead-global", 40, 3600);
  if (!everyone.allowed) return refuseTooMany(everyone.retryAfterSeconds);

  // 1. zan-workspace, first. At most 4.5 seconds with its retry, so the two
  //    mails below still fit inside the host's 10-second function limit.
  const stored = await captureToWorkspace("lead", workspaceRecord(lead), { budgetMs: 4500 });
  const inCrm = stored.ok && !stored.dryRun;
  if (!stored.ok && stored.reason !== "not_configured") {
    logger.error({ reason: stored.reason }, "leads: not stored in zan-workspace");
  }

  // 2. The team's mail, whatever happened above. Either one landing means the
  //    lead reached us. Only when both fail is the visitor told, and then they
  //    must not also have a mail saying it arrived.
  try {
    await sendLeadNotification(lead);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, "leads: team mail failed");
    if (!inCrm) {
      return plain ? plainText(502, NOT_SENT) : fail(502, "Your enquiry could not be sent. Please try again.");
    }
  }

  // The lead has gone, so nothing below may report a failure to the visitor.
  const confirmations = await limit(lead.email.toLowerCase(), "lead-confirmation", 3, 3600);
  if (confirmations.allowed) {
    try {
      await sendLeadConfirmation(lead);
    } catch (error) {
      // Not the message: a refusal quotes the visitor's address, and logs are no place for that.
      const { code, responseCode } = error as { code?: string; responseCode?: number };
      logger.warn({ code, responseCode }, "leads: confirmation not sent");
    }
  }

  logger.info({ source: lead.source, inCrm }, "leads: sent");
  return plain ? seeOther("/thank-you") : ok({ sent: true });
});

/* ── Every other method ──────────────────────────────────────────────────────
   Next answers a method a route does not export with an empty 405 and no Allow
   header. It also builds OPTIONS and HEAD from what is exported, so exporting the
   others means saying those two as well, or OPTIONS would list them as allowed. */

const notAllowed = () => methodNotAllowed("POST");

export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;

export const HEAD = () => new Response(null, { status: 405, headers: { Allow: "POST" } });

/** No Access-Control-Allow-* on purpose: this is what refuses another site's JSON. */
export const OPTIONS = () => new Response(null, { status: 204, headers: { Allow: "OPTIONS, POST" } });

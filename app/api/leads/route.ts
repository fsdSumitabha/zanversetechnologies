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
  isLocalPath,
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
import { clientIp, rateLimit, type RateLimitResult } from "@/server/lib/rateLimit";
import { sendLeadConfirmation, sendLeadNotification } from "@/server/services/mail.service";

/** Nodemailer needs node:net and node:tls, and Mongoose the Node runtime. */
export const runtime = "nodejs";
export const maxDuration = 60;

/** One line, cut rather than refused: a long ad link must not cost the lead. */
const line = (max: number) => z.string().transform((v) => sanitiseMessage(v, max).replace(/\s+/g, " "));

const pageLine = line(500);

const bodySchema = z.object({
  name: line(80).refine(Boolean),
  email: z.string().trim().max(160).regex(new RegExp(`^${EMAIL_PATTERN}$`), "Enter a valid email address"),
  phone: line(32).optional(),
  service: line(120).refine(Boolean),
  interest: line(120).optional(),
  message: z.string().transform((v) => sanitiseMessage(v, 5000)).optional(),
  source: line(80).optional(),
  page: pageLine.optional(),
});

/**
 * rateLimit() with a ceiling on the wait. Mongo takes 10 seconds to report itself
 * unreachable and this route asks three times, which held the team's mail back
 * 20 seconds, long enough for a host to end the function. Past 3 seconds the
 * check counts as passed, as it does when rateLimit() itself gives up.
 */
function limit(identity: string, scope: string, max: number, windowSeconds: number): Promise<RateLimitResult> {
  return Promise.race([
    rateLimit(identity, scope, max, windowSeconds),
    new Promise<RateLimitResult>((resolve) =>
      setTimeout(() => resolve({ allowed: true, remaining: 0, retryAfterSeconds: 0 }), 3000),
    ),
  ]);
}

/* ── A plain form post ───────────────────────────────────────────────────── */

/** Where a refused plain post lands when no page of this site sent it. */
const FORM_PAGE = "/contact-us";
const INVALID = "form=invalid";

const TOO_MANY = `Too many enquiries right now. Please try again in a few minutes, or email us directly at ${site.email}.`;
const NOT_SENT = `That did not send. Please go back and try again, or email us directly at ${site.email}.`;

function httpUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** The names this site answers to. Another site's page cannot set any of these on a post. */
function ownHosts(request: Request): Set<string> {
  const hosts = new Set([new URL(site.url).host, new URL(request.url).host]);
  for (const header of ["host", "x-forwarded-host"]) {
    const value = request.headers.get(header)?.split(",")[0].trim().toLowerCase();
    if (value) hosts.add(value);
  }
  return hosts;
}

/**
 * Whether a browser sent this from another site's page. The browser writes both
 * headers and a page cannot change them. "same-site" is a sibling subdomain, which
 * has no form of ours either: the forms post to their own origin. A caller with
 * neither header is not a browser on someone else's page, and it passes: an agent
 * or a script speaks for itself, and the limits still apply to it.
 */
function fromAnotherSite(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "cross-site" || fetchSite === "same-site";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const from = httpUrl(origin);
  return !from || !ownHosts(request).has(from.host);
}

/**
 * Back to the page that sent a refused post: only ever its path and query string,
 * only when the Referer names this site, and only a path that stays on this site
 * once it is a Location. Nothing in the body is read for this. Anything else goes
 * to the contact page.
 */
function backToForm(request: Request): Response {
  const from = httpUrl(request.headers.get("referer"));
  if (!from || !ownHosts(request).has(from.host) || !isLocalPath(from.pathname)) {
    return seeOther(`${FORM_PAGE}?${INVALID}`);
  }
  from.searchParams.set("form", "invalid");
  return seeOther(`${from.pathname}?${from.searchParams}`);
}

/** In the shape the forms' script sends: host, path and query string. */
function pageFromReferer(request: Request): string {
  const from = httpUrl(request.headers.get("referer"));
  return from ? pageLine.parse(`${from.host}${from.pathname}${from.search}`) : "unknown";
}

/**
 * A landing page's field holds the national number, with the +971 fixed beside it
 * on the page. The form's script writes it out in full before it posts, so with no
 * script that happens here. A number that is not a UAE one stays as typed: it is
 * still a lead, and it still has an address to reply to.
 */
function landingPhone(phone: string | undefined): string | undefined {
  if (!phone) return phone;
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

  // First and alone. This is the lead: if it fails the visitor is told, and they
  // must not also have a mail saying it arrived.
  try {
    await sendLeadNotification(lead);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, "leads: team mail failed");
    return plain ? plainText(502, NOT_SENT) : fail(502, "Your enquiry could not be sent. Please try again.");
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

  logger.info({ source: lead.source }, "leads: sent");
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

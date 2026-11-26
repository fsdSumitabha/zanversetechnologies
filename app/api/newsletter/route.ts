import { z } from "zod";
import { NEWSLETTER_CONSENT, NEWSLETTER_RECORD } from "@/constants/newsletter";
import { EMAIL_PATTERN, TRAP_FIELD } from "@/lib/leads";
import { NEWSLETTER_HASH } from "@/lib/newsletter";
import { logger } from "@/server/config/logger";
import {
  fail,
  forbidden,
  isFormPost,
  isJsonPost,
  methodNotAllowed,
  ok,
  parseBody,
  readFormFields,
  route,
  sanitiseMessage,
  seeOther,
  tooMany,
} from "@/server/lib/http";
import { fromAnotherSite, ownReferer } from "@/server/lib/origin";
import { clientIp, rateLimitWithin as limit } from "@/server/lib/rateLimit";
import { captureToWorkspace } from "@/server/services/workspace.service";

/** Mongoose, for the rate limits. */
export const runtime = "nodejs";
export const maxDuration = 30;

const pageLine = z.string().transform((v) => sanitiseMessage(v, 500).replace(/\s+/g, " "));

const bodySchema = z.object({
  email: z.string().trim().max(160).regex(new RegExp(`^${EMAIL_PATTERN}$`), "Enter a valid email address"),
  /**
   * The box next to the form. true from the band's script, "yes" from a plain
   * post (the checkbox's value). Nothing else counts as consent, and an
   * unticked box sends nothing at all, so it fails here.
   */
  consent: z.union([z.literal(true), z.literal("yes")], { error: "Tick the box to agree to the newsletter" }),
  page: pageLine.optional(),
});

/**
 * A plain post goes back to the page it came from, at the band, with the
 * outcome as the fragment the band shows (lib/newsletter.ts). Only ever this
 * site's own path (ownReferer); anything else goes to the homepage.
 */
function backToBand(request: Request, outcome: keyof typeof NEWSLETTER_HASH): Response {
  const from = ownReferer(request);
  const path = from ? `${from.pathname}${from.search}` : "/";
  return seeOther(`${path}#${NEWSLETTER_HASH[outcome]}`);
}

/** In the shape the band's script sends: host, path and query string. */
function pageFromReferer(request: Request): string | null {
  const from = ownReferer(request);
  return from ? pageLine.parse(`${from.host}${from.pathname}${from.search}`) : null;
}

/**
 * POST /api/newsletter
 *
 * The sign-up band above the footer. zanservices has a route of the same
 * name for its own newsletter form. It checks the address and the consent,
 * then hands the sign-up to zan-workspace's /api/integrations/newsletter,
 * which stores it and sends the newsletter
 * (server/services/workspace.service.ts has the contract). Nothing is stored
 * here.
 *
 *   Per caller   5 in 10 minutes. Enough for a person, not for a script.
 *   Site-wide    100 an hour, so a flood of made-up addresses stops here and
 *                not in zan-workspace's contact list.
 *
 * Both fail open, as the leads route's do: a Mongo outage must not cost a
 * sign-up.
 *
 * THE SAME ANSWER FOR A NEW ADDRESS AND ONE ALREADY ON THE LIST. Telling the
 * two apart would let anyone check whether an address is subscribed.
 *
 * TWO WAYS IN, as on /api/leads. The band's script posts JSON and reads JSON
 * back. With no script running (a press before hydration, JavaScript off) the
 * browser posts the form itself, and the answer is a 303 back to the page with
 * a fragment the band shows through CSS. The form has to post, never GET: a GET
 * would put the address in the URL, the logs and every analytics hit.
 *
 * THE TRAP, and another site's page: as on /api/leads. A filled trap gets the
 * same answer as a real sign-up with nothing sent; a browser post from another
 * site is refused before anything else, with no limit used.
 */
export const POST = route(async (request: Request) => {
  const plain = isFormPost(request);

  if (!isJsonPost(request) && fromAnotherSite(request)) {
    logger.warn({ origin: request.headers.get("origin") }, "newsletter: refused a post from another site");
    return plain ? seeOther("/") : forbidden();
  }

  const refuseTooMany = (retryAfterSeconds: number) =>
    plain ? backToBand(request, "notSent") : tooMany(retryAfterSeconds);

  const ip = clientIp(request);
  if (ip) {
    const caller = await limit(ip, "newsletter", 5, 600);
    if (!caller.allowed) return refuseTooMany(caller.retryAfterSeconds);
  }

  let body: z.infer<typeof bodySchema>;
  if (plain) {
    const fields = await readFormFields(request);
    // Before the schema, so a bot's bad fields cannot tell it apart from a sign-up.
    if (fields[TRAP_FIELD]?.trim()) {
      logger.info({}, "newsletter: trap field filled, nothing sent");
      return backToBand(request, "subscribed");
    }
    const parsed = bodySchema.safeParse(fields);
    if (!parsed.success) return backToBand(request, "invalid");
    body = parsed.data;
  } else {
    const parsed = await parseBody(request, bodySchema);
    if (!parsed.ok) return parsed.response;
    body = parsed.data;
  }

  // Only now, so a caller already refused above, or sending junk, cannot use
  // up the site's allowance and shut real visitors out.
  const everyone = await limit("site", "newsletter-global", 100, 3600);
  if (!everyone.allowed) return refuseTooMany(everyone.retryAfterSeconds);

  // The words and their version come from constants/newsletter.ts, never
  // from the request, so a caller cannot record words nobody was shown.
  // consent.at is this server's clock, not the browser's.
  const result = await captureToWorkspace("newsletter", {
    region: NEWSLETTER_RECORD.region,
    form: NEWSLETTER_RECORD.form,
    page: body.page || pageFromReferer(request),
    email: body.email.toLowerCase(),
    consent: { text: NEWSLETTER_CONSENT.text, version: NEWSLETTER_CONSENT.version, at: new Date().toISOString() },
  });

  // Never the address: logs are no place for it.
  if (!result.ok) {
    if (result.reason === "not_configured") {
      logger.error({}, "newsletter: zan-workspace is not set up (ZAN_WORKSPACE_URL, ZAN_WORKSPACE_API_KEY)");
      return plain ? backToBand(request, "notSent") : fail(503, "Sign-ups are not open yet. Please try again later.");
    }
    logger.error({ reason: result.reason }, "newsletter: not passed on to zan-workspace");
    return plain ? backToBand(request, "notSent") : fail(502, "That did not go through. Please try again.");
  }

  logger.info({ dryRun: result.dryRun }, "newsletter: subscribed");
  return plain ? backToBand(request, "subscribed") : ok({ subscribed: true });
});

/* ── Every other method, as on /api/leads ─────────────────────────────────── */

const notAllowed = () => methodNotAllowed("POST");

export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;

export const HEAD = () => new Response(null, { status: 405, headers: { Allow: "POST" } });

/** No Access-Control-Allow-* on purpose: this is what refuses another site's JSON. */
export const OPTIONS = () => new Response(null, { status: 204, headers: { Allow: "OPTIONS, POST" } });

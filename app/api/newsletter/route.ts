import { z } from "zod";
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
import { forwardSubscription, WorkspaceNotConnected } from "@/server/services/newsletter.service";

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
function pageFromReferer(request: Request): string {
  const from = ownReferer(request);
  return from ? pageLine.parse(`${from.host}${from.pathname}${from.search}`) : "unknown";
}

/**
 * POST /api/newsletter
 *
 * The sign-up band above the footer. It checks the address and the consent,
 * then hands the sign-up to zan-workspace, which stores it and sends the
 * newsletter (server/services/newsletter.service.ts). Nothing is stored here.
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

  try {
    const result = await forwardSubscription({
      email: body.email,
      page: body.page || pageFromReferer(request),
      consentAt: new Date(),
    });
    logger.info({ result }, "newsletter: subscribed");
  } catch (error) {
    // Never the address: logs are no place for it.
    if (error instanceof WorkspaceNotConnected) {
      logger.error({}, "newsletter: ZAN_WORKSPACE_NEWSLETTER_URL and ZAN_WORKSPACE_API_KEY are not set");
      return plain ? backToBand(request, "notSent") : fail(503, "Sign-ups are not open yet. Please try again later.");
    }
    logger.error({ err: error instanceof Error ? error.message : String(error) }, "newsletter: not passed on to zan-workspace");
    return plain ? backToBand(request, "notSent") : fail(502, "That did not go through. Please try again.");
  }

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

import { z } from "zod";
import { EMAIL_PATTERN } from "@/lib/leads";
import { logger } from "@/server/config/logger";
import { fail, ok, parseBody, route, sanitiseMessage, tooMany } from "@/server/lib/http";
import { clientIp, rateLimit, type RateLimitResult } from "@/server/lib/rateLimit";
import { sendLeadConfirmation, sendLeadNotification } from "@/server/services/mail.service";

/** Nodemailer needs node:net and node:tls, and Mongoose the Node runtime. */
export const runtime = "nodejs";
export const maxDuration = 60;

/** One line, cut rather than refused: a long ad link must not cost the lead. */
const line = (max: number) => z.string().transform((v) => sanitiseMessage(v, max).replace(/\s+/g, " "));

const bodySchema = z.object({
  name: line(80).refine(Boolean),
  email: z.string().trim().max(160).regex(new RegExp(`^${EMAIL_PATTERN}$`), "Enter a valid email address"),
  phone: line(32).optional(),
  service: line(120).refine(Boolean),
  interest: line(120).optional(),
  message: z.string().transform((v) => sanitiseMessage(v, 5000)).optional(),
  source: line(80),
  page: line(500),
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
 */
export const POST = route(async (request: Request) => {
  const ip = clientIp(request);
  if (ip) {
    const caller = await limit(ip, "lead", 5, 600);
    if (!caller.allowed) return tooMany(caller.retryAfterSeconds);
  }

  const parsed = await parseBody(request, bodySchema);
  if (!parsed.ok) return parsed.response;
  const lead = parsed.data;

  // Only now, so a caller already refused above, or sending junk, cannot use up
  // the site's allowance and shut real visitors out.
  const everyone = await limit("site", "lead-global", 40, 3600);
  if (!everyone.allowed) return tooMany(everyone.retryAfterSeconds);

  // First and alone. This is the lead: if it fails the visitor is told, and they
  // must not also have a mail saying it arrived.
  try {
    await sendLeadNotification(lead);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, "leads: team mail failed");
    return fail(502, "Your enquiry could not be sent. Please try again.");
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
  return ok({ sent: true });
});

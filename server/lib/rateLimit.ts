import { Schema, model, models, type Model } from "mongoose";
import { connectDatabase } from "../config/db";
import { isProduction } from "../config/env";
import { logger } from "../config/logger";

/* ═══════════════════════════════════════════════════════════════════════════
   RATE LIMITING — Mongo-backed on purpose.

   The usual in-memory limiter counts per process. Under serverless that means
   per container, so a caller gets the limit multiplied by however many
   containers the platform happens to spin up — i.e. no limit at all.

   A fixed window in Mongo costs one atomic upsert per request and is correct
   across every instance. The TTL index does the cleanup.
   ═══════════════════════════════════════════════════════════════════════════ */

const schema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});

const RateLimit =
  (models.RateLimit as Model<{ key: string; count: number; expiresAt: Date }>) ??
  model("RateLimit", schema);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Bucket the window so every request inside it shares one key. */
function windowKey(identity: string, scope: string, windowSeconds: number) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  return {
    key: `${scope}:${identity}:${bucket}`,
    expiresAt: new Date((bucket + 1) * windowSeconds * 1000),
  };
}

/**
 * @param identity  Caller identity — conversation id, agent id, login email or IP.
 * @param scope     Endpoint name, so limits do not bleed across routes.
 */
export async function rateLimit(
  identity: string,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    await connectDatabase();

    const { key, expiresAt } = windowKey(identity, scope, windowSeconds);

    const doc = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    const count = doc?.count ?? 1;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)),
    };
  } catch (error) {
    // Fail OPEN. A limiter outage must not take the chatbot down with it — the
    // downstream endpoints all validate and size-cap their input anyway.
    logger.error({ err: String(error), scope }, "ratelimit: check failed, allowing");
    return { allowed: true, remaining: 0, retryAfterSeconds: 0 };
  }
}

/** Forget a caller's count in the current window. Takes the same window as the limit it resets. */
export async function clearRateLimit(
  identity: string,
  scope: string,
  windowSeconds: number,
): Promise<void> {
  try {
    await connectDatabase();
    await RateLimit.deleteOne({ key: windowKey(identity, scope, windowSeconds).key });
  } catch (error) {
    // The old count simply stands until its window ends.
    logger.error({ err: String(error), scope }, "ratelimit: reset failed");
  }
}

/* ── Caller IP ───────────────────────────────────────────────────────────────
   Only the host's own header can be trusted. The first value of
   x-forwarded-for is whatever the client wrote there, so reading it let a
   caller pick a fresh IP — and a fresh limit — on every request.

     · Vercel overwrites x-real-ip (and x-forwarded-for) with the real caller.
     · Netlify sets x-nf-client-connection-ip, the one client-IP header it
       guarantees; it uses x-forwarded-for internally.

   Vercel says so at runtime with VERCEL=1. Netlify exposes no equivalent to
   functions, so it is the default. Anything else — Cloudflare in front, a VPS
   behind nginx — must name its header in TRUSTED_IP_HEADER, because a header
   the host does not set is a header the client does.

   A missing header gives null, never a shared placeholder: one bucket for
   every visitor meant twenty chat openings anywhere locked the whole site
   out. Callers skip their per-IP check instead and keep their other limits. */
const CONFIGURED_IP_HEADER = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
const TRUSTED_IP_HEADER =
  CONFIGURED_IP_HEADER || (process.env.VERCEL ? "x-real-ip" : "x-nf-client-connection-ip");

// Once per process each: the answer does not change between requests.
let checkedHost = false;
let reportedMissing = false;

/**
 * Caller IP from the host's trusted header, for endpoints with no authenticated
 * identity. Null when the host did not set it.
 */
export function clientIp(request: Request): string | null {
  if (!checkedHost) {
    checkedHost = true;
    // Netlify is only assumed. Saying so in production is what catches a
    // deploy elsewhere, where the assumed header is one the client writes.
    if (isProduction() && !CONFIGURED_IP_HEADER && !process.env.VERCEL) {
      logger.warn(
        { header: TRUSTED_IP_HEADER },
        "ratelimit: TRUSTED_IP_HEADER is not set, so Netlify's x-nf-client-connection-ip is assumed. " +
          "Any other host must set TRUSTED_IP_HEADER to the header it sets.",
      );
    }
  }

  // If the configured header is a list, the last entry is the one the host
  // appended; anything to its left came from the client.
  const ip = request.headers.get(TRUSTED_IP_HEADER)?.split(",").pop()?.trim();
  if (ip) return ip;

  if (!reportedMissing) {
    reportedMissing = true;
    logger.error(
      { header: TRUSTED_IP_HEADER },
      `Client IP header ${TRUSTED_IP_HEADER} is missing. Set TRUSTED_IP_HEADER for this host.`,
    );
  }
  return null;
}

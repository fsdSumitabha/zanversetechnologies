import { NEWSLETTER_CONSENT, NEWSLETTER_RECORD } from "@/constants/newsletter";
import { getWorkspaceEnv, isProduction } from "../config/env";
import { logger } from "../config/logger";

/* ═══════════════════════════════════════════════════════════════════════════
   NEWSLETTER SIGN-UPS → ZAN-WORKSPACE

   This site does not keep the list. app/api/newsletter checks a sign-up and
   hands it here, and this posts it to zan-workspace, which stores it as an
   EmailContact and sends the campaigns. Server to server only: the key below
   never reaches a browser.

   ── THE REQUEST zan-workspace RECEIVES ─────────────────────────────────────

     POST <ZAN_WORKSPACE_NEWSLETTER_URL>
     Content-Type: application/json
     x-api-key: <ZAN_WORKSPACE_API_KEY>

     {
       "email": "name@company.com",
       "region": "AE",
       "marketingConsent": true,
       "consentSource": "form:zanversetechnologies.com/newsletter",
       "consentAt": "2026-11-25T09:30:00.000Z",
       "consentText": "I am 18 or over, and I agree to receive …",
       "consentVersion": "2026-11-25",
       "tags": ["newsletter", "zanversetechnologies.com"],
       "page": "zanversetechnologies.com/services/web-development"
     }

   The names follow zan-workspace's EmailContact model (marketingConsent,
   consentSource, consentAt, region, tags). consentText and consentVersion are
   the proof of what the person agreed to; the model has no field for them yet,
   so store them beside the contact (customFields will do). consentAt is this
   server's clock, not the browser's.

   ── WHAT zan-workspace SHOULD DO ───────────────────────────────────────────

     - Check x-api-key with a timing-safe compare, the way
       src/lib/security/timingSafeKey.ts does for CLIENT_PORTAL_API_KEY, and
       refuse every request when its own copy of the key is not set.
     - Upsert on (region, emailNormalized): a second sign-up from the same
       address is not an error.
     - Not reset a withdrawal silently: an address on the suppression list
       has unsubscribed, and a new sign-up is new consent, so clear the
       suppression only on purpose.
     - Answer any 2xx once the address is stored, or already there. Anything
       else counts as failed, and the visitor is asked to try again.

   It is not followed if it redirects: a redirect would carry the key to
   wherever it points. So the URL has to be the final one, https included.
   ═══════════════════════════════════════════════════════════════════════════ */

/** How long zan-workspace has to answer before the visitor is told it failed. */
const TIMEOUT_MS = 8000;

export interface Subscription {
  email: string;
  /** Host, path and query string of the page the person signed up on. */
  page: string;
  /** When the person agreed. */
  consentAt: Date;
}

/** zan-workspace is not connected, in production. The route answers 503. */
export class WorkspaceNotConnected extends Error {}

/**
 * Resolves once zan-workspace has stored the sign-up. Rejects on anything else.
 *
 * With no URL and key set, outside production, nothing is sent and the sign-up
 * is only logged, so the band can be built and tried before zan-workspace has
 * its route. In production that is a WorkspaceNotConnected error instead.
 */
export async function forwardSubscription(sub: Subscription): Promise<"sent" | "dry-run"> {
  const env = getWorkspaceEnv();
  if (!env) {
    if (isProduction()) throw new WorkspaceNotConnected("ZAN_WORKSPACE_NEWSLETTER_URL and ZAN_WORKSPACE_API_KEY are not set");
    logger.warn({}, "newsletter: zan-workspace is not connected, so this sign-up was not sent (development only)");
    return "dry-run";
  }

  const body = {
    email: sub.email,
    region: NEWSLETTER_RECORD.region,
    marketingConsent: true,
    consentSource: NEWSLETTER_RECORD.consentSource,
    consentAt: sub.consentAt.toISOString(),
    consentText: NEWSLETTER_CONSENT.text,
    consentVersion: NEWSLETTER_CONSENT.version,
    tags: NEWSLETTER_RECORD.tags,
    page: sub.page,
  };

  const response = await fetch(env.ZAN_WORKSPACE_NEWSLETTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": env.ZAN_WORKSPACE_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`zan-workspace answered ${response.status}`);
  return "sent";
}

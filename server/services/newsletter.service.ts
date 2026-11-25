import { NEWSLETTER_CONSENT, NEWSLETTER_RECORD } from "@/constants/newsletter";
import { isProduction } from "../config/env";
import { logger } from "../config/logger";
import { postToWorkspace, WORKSPACE_PATHS, WorkspaceNotConnected, workspaceConnected } from "../lib/workspace";

/* ═══════════════════════════════════════════════════════════════════════════
   NEWSLETTER SIGN-UPS → ZAN-WORKSPACE

   This site does not keep the list. app/api/newsletter checks a sign-up and
   hands it here, and this posts it to zan-workspace, which stores it as an
   EmailContact and sends the campaigns. The base URL, the key and the rules
   every zan-workspace route follows are in server/lib/workspace.ts.

   ── THE REQUEST zan-workspace RECEIVES ─────────────────────────────────────

     POST <ZAN_WORKSPACE_URL>/api/integrations/zanverse/newsletter
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

   ── WHAT THE ROUTE SHOULD DO, beyond the key check every route makes ───────

     - Upsert on (region, emailNormalized): a second sign-up from the same
       address is not an error.
     - Not reset a withdrawal silently: an address on the suppression list
       has unsubscribed, and a new sign-up is new consent, so clear the
       suppression only on purpose.
     - Answer any 2xx once the address is stored, or already there. Anything
       else counts as failed, and the visitor is asked to try again.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Subscription {
  email: string;
  /** Host, path and query string of the page the person signed up on. */
  page: string;
  /** When the person agreed. */
  consentAt: Date;
}

/**
 * Resolves once zan-workspace has stored the sign-up. Rejects on anything else.
 *
 * With zan-workspace not connected, outside production, nothing is sent and
 * the sign-up is only logged, so the band can be built and tried before
 * zan-workspace has its route. In production that is WorkspaceNotConnected.
 */
export async function forwardSubscription(sub: Subscription): Promise<"sent" | "dry-run"> {
  if (!workspaceConnected()) {
    if (isProduction()) throw new WorkspaceNotConnected();
    logger.warn({}, "newsletter: zan-workspace is not connected, so this sign-up was not sent (development only)");
    return "dry-run";
  }

  await postToWorkspace(WORKSPACE_PATHS.newsletter, {
    email: sub.email,
    region: NEWSLETTER_RECORD.region,
    marketingConsent: true,
    consentSource: NEWSLETTER_RECORD.consentSource,
    consentAt: sub.consentAt.toISOString(),
    consentText: NEWSLETTER_CONSENT.text,
    consentVersion: NEWSLETTER_CONSENT.version,
    tags: NEWSLETTER_RECORD.tags,
    page: sub.page,
  });
  return "sent";
}

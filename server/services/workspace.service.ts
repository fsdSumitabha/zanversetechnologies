import { randomUUID } from "node:crypto";
import { SITE, WORKSPACE_ENDPOINTS, getWorkspaceConfig } from "../config/workspace";
import { logger } from "../config/logger";
import { workspaceRequest } from "../lib/workspaceClient";
import type { WorkspaceRegion } from "../lib/phone";

/* ═══════════════════════════════════════════════════════════════════════════
   LEADS AND SIGN-UPS → ZAN-WORKSPACE: what this site sends, and in what shape.

   The same file is in zanservices and zanverse-technologies, and
   zan-workspace checks every body against the same contract
   (src/lib/integrations/contract.ts there; docs/website-integrations.md has
   it with examples). Newsletter sign-ups and leads are different things:
   two routes, two records, and a lead is never added to the newsletter list.

   ── EVERY BODY ─────────────────────────────────────────────────────────────

     {
       "id":      "3f6c…",                    uuid, also the Idempotency-Key,
                                              the same on a retry
       "source":  "zanservices",              this site (SITE.id). It has to
                                              be the site whose key was sent
       "sentAt":  "2026-11-26T10:00:00.000Z", when this site got the form
       "region":  "IN" | "US" | "AE",         zan-workspace's region codes
       "form":    "contact_form",             which form, from the list below
       "page":    "zanservices.com/contact-us?from=%2Fweb" | null
                                              host, path and query string, so
                                              an ad's tags say which campaign
                                              paid for the visit
       …the record below
     }

   zan-workspace never takes a source name from the body. It makes every one
   from the site's domain: the lead's source "zanservices.com", the contact's
   consentSource "form:zanservices.com/newsletter_form", and its tags.

   ── POST /api/integrations/leads ───────────────────────────────────────────

     {
       "name":     "Asha Rao",
       "email":    "asha@company.com" | null,    lower case
       "phone":    "+919830012345",              required. E.164 when it could be read
                                                 (server/lib/phone.ts), else
                                                 as typed
       "service":  "Web Development" | null,
       "interest": "Growth package" | null,      the package, on a landing page
       "message":  "We need…" | null,
       "chat":     null | {                      chat_widget only
         "conversationId": "…",
         "leadScore": "HIGH" | "MEDIUM" | "LOW" | null,
         "service", "projectType", "budget", "timeline": string | null,
         "requirements", "technology": string[],
         "summary": string | null
       }
     }

     Every lead has a phone: every lead form on both sites requires one. The
     email may be null (the chat card does not ask for one). The lawful basis
     is the visitor's own
     request to be contacted (DPDP Act s. 7(a); GDPR Art. 6(1)(b)), which
     covers replying to it, not marketing.

   ── POST /api/integrations/newsletter ──────────────────────────────────────

     {
       "email":   "name@company.com",
       "consent": {
         "text":    "Yes, email me …",           the exact words next to the box
         "version": "2026-11-25",                which version of them
         "at":      "2026-11-26T10:00:00.000Z"   when the person agreed, by
                                                 this server's clock
       }
     }

     The consent block is the record of consent the DPDP Act (s. 6(10)) and
     the GDPR (Art. 7(1)) expect the sender to be able to produce. No
     confirmation email is sent, so the answer is always "subscribed",
     including for an address that unsubscribed before: it stays
     unsubscribed, and the answer does not say so.

   ── WHAT zan-workspace ANSWERS ─────────────────────────────────────────────

     200  { "success": true, "status": "received" | "subscribed" }
     409  the same id is still being saved: counted as received
     400 / 403 / 415  the body or the key is wrong: a bug here, logged
     401  the key was refused
     429 / 5xx  try again later; retried once (server/lib/workspaceClient.ts)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The forms, by the names zan-workspace shows. The same list in both sites,
 * so the CRM names a form the same way whichever site it is on.
 */
export type LeadFormId =
  | "contact_form" //      the enquiry form on the homepage and /contact-us
  | "contact_modal" //     the timed contact popup
  | "service_page_form" // the hero form on a service page
  | "landing_page_form" // a paid landing page (/lp/<slug>)
  | "chat_widget" //       the chat assistant's contact card
  | "webmcp" //            the AI agent tool
  | "api"; //              a caller of /api/leads that named no form

export type NewsletterFormId = "newsletter_form";

interface RecordBase {
  region: WorkspaceRegion;
  page: string | null;
}

export interface ChatNotes {
  conversationId: string;
  leadScore: string | null;
  service: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
  requirements: string[];
  technology: string[];
  summary: string | null;
}

export interface LeadRecord extends RecordBase {
  form: LeadFormId;
  name: string;
  email: string | null;
  phone: string;
  service: string | null;
  interest: string | null;
  message: string | null;
  chat: ChatNotes | null;
}

export interface NewsletterRecord extends RecordBase {
  form: NewsletterFormId;
  email: string;
  consent: { text: string; version: string; at: string };
}

/** What each endpoint is sent. */
export interface CapturePayloads {
  lead: LeadRecord;
  newsletter: NewsletterRecord;
}

export type CaptureResult =
  | { ok: true; dryRun: boolean }
  | { ok: false; reason: "not_configured" | "rejected" | "unavailable" };

/**
 * A site's own region id as zan-workspace's region code: "in" is "IN", "us"
 * is "US". zan-workspace's codes are the ones in every payload.
 */
export function workspaceRegion(id: string): WorkspaceRegion {
  const code = id.trim().toUpperCase();
  if (code === "IN" || code === "US" || code === "AE") return code;
  throw new Error(`workspace: "${id}" is not a region zan-workspace knows`);
}

/** Whether a capture can go anywhere: live, or a dry run. */
export function captureEnabled(): boolean {
  return getWorkspaceConfig().mode !== "off";
}

/** k***@company.com: enough to recognise a test address in a log, not to read it. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain ?? ""}`;
}

/** A record as the dry run logs it: the address masked, everything else personal left out. */
function forLog(record: object): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(record as Record<string, unknown>) };
  if (typeof out.email === "string") out.email = maskEmail(out.email);
  for (const key of ["name", "phone", "message"]) {
    if (typeof out[key] === "string") out[key] = "[set]";
  }
  if (out.chat && typeof out.chat === "object") out.chat = { ...(out.chat as object), summary: "[set]" };
  return out;
}

/**
 * Send one record to its zan-workspace route. Never throws: every outcome is
 * a result the caller can answer with. `budgetMs` caps the whole call, retry
 * included (server/lib/workspaceClient.ts).
 */
export async function captureToWorkspace<E extends keyof CapturePayloads>(
  endpoint: E,
  record: CapturePayloads[E],
  { budgetMs }: { budgetMs?: number } = {},
): Promise<CaptureResult> {
  const config = getWorkspaceConfig();
  if (config.mode === "off") return { ok: false, reason: "not_configured" };

  const id = randomUUID();
  const body = { id, source: SITE.id, sentAt: new Date().toISOString(), ...record };

  if (config.mode === "dry-run") {
    logger.info({ endpoint, ...forLog(body) }, "workspace: dry run, not sent");
    return { ok: true, dryRun: true };
  }

  const result = await workspaceRequest(WORKSPACE_ENDPOINTS[endpoint], {
    method: "POST",
    body,
    idempotencyKey: id,
    budgetMs,
  });

  if (result.ok) return { ok: true, dryRun: false };
  // The same id is still being saved by the first attempt.
  if (result.reason === "conflict") return { ok: true, dryRun: false };
  // Down, slow or busy: worth trying again later.
  if (result.reason === "unavailable") return { ok: false, reason: "unavailable" };
  // A refused key, a region this site may not send, or a body that does not
  // match the contract: something to fix in this site's setup or code.
  return { ok: false, reason: "rejected" };
}

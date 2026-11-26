import { isProduction } from "./env";
import { logger } from "./logger";

/* ═══════════════════════════════════════════════════════════════════════════
   ZAN-WORKSPACE — the plug between this site and zan-workspace. Server only.

   zanservices and zanverse-technologies send their leads and newsletter
   sign-ups to the same two zan-workspace routes, in the same shape, with the
   same headers. This file, server/lib/workspaceClient.ts and
   server/services/workspace.service.ts are the same in both sites, apart
   from SITE below.

     ZAN_WORKSPACE_URL       zan-workspace's base URL, e.g.
                             https://crm.example.com. The routes are paths
                             under it (WORKSPACE_ENDPOINTS below).
     ZAN_WORKSPACE_API_KEY   this site's own key, at least 32 characters,
                             sent as `Authorization: Bearer <key>` on every
                             call. zan-workspace holds the same value under
                             SITE.keyInWorkspace. The key is how it knows
                             which site is calling, and so which regions the
                             site may write to and which source name its
                             records get. Never sent to a browser.
     ZAN_WORKSPACE_DRY_RUN   "true" logs every capture instead of sending
                             it, anywhere, e.g. on a preview deploy.

   Kept apart from env.ts on purpose. That schema requires the chat's Mongo,
   WhatsApp and Pusher keys, and a missing WhatsApp token must not stop a
   newsletter sign-up.

   Three modes:

     live     both variables set and valid: every capture is POSTed.
     dry-run  ZAN_WORKSPACE_DRY_RUN=true, or nothing set outside production.
              A capture is validated and logged (contact details masked), not
              sent, so a form can be built and tested before zan-workspace
              is connected.
     off      production with nothing set, or a value that is invalid.
              Nothing is sent, and no visitor meets a form that cannot work:
              zanservices hides its newsletter section and sends enquiries by
              EmailJS alone; zanverse-technologies' production build shows no
              newsletter band, and its enquiries go by mail alone.
   ═══════════════════════════════════════════════════════════════════════════ */

/** This site, as zan-workspace knows it. The one part that differs per site. */
export const SITE = {
  /** Sent as `source` in every body. zan-workspace checks it against the key. */
  id: "zanverse-technologies",
  /** Where zan-workspace keeps this site's key. Named in the logs when a key is refused. */
  keyInWorkspace: "ZANVERSE_TECHNOLOGIES_SITE_API_KEY",
} as const;

/**
 * zan-workspace's routes, as paths under ZAN_WORKSPACE_URL. The same two
 * for every site: one for enquiries, one for newsletter sign-ups.
 */
export const WORKSPACE_ENDPOINTS = {
  /** Enquiries: every enquiry form, popup, landing page and chat widget. */
  lead: "/api/integrations/leads",
  /** Newsletter sign-ups. */
  newsletter: "/api/integrations/newsletter",
} as const;

export type WorkspaceEndpoint = keyof typeof WORKSPACE_ENDPOINTS;

export type WorkspaceConfig =
  | { mode: "live"; baseUrl: string; apiKey: string }
  | { mode: "dry-run" }
  | { mode: "off"; reason: string };

/** Below this, a shared secret is guessable. `openssl rand -hex 32` gives 64. */
const MIN_KEY_LENGTH = 32;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

let reported = false;

function read(): WorkspaceConfig {
  const base = process.env.ZAN_WORKSPACE_URL?.trim() ?? "";
  const apiKey = process.env.ZAN_WORKSPACE_API_KEY?.trim() ?? "";

  if (process.env.ZAN_WORKSPACE_DRY_RUN?.trim() === "true") return { mode: "dry-run" };

  if (!base && !apiKey) {
    return isProduction()
      ? { mode: "off", reason: "ZAN_WORKSPACE_URL and ZAN_WORKSPACE_API_KEY are not set" }
      : { mode: "dry-run" };
  }
  if (!base) return { mode: "off", reason: "ZAN_WORKSPACE_URL is not set" };
  if (!apiKey) return { mode: "off", reason: "ZAN_WORKSPACE_API_KEY is not set" };
  if (apiKey.length < MIN_KEY_LENGTH) {
    return { mode: "off", reason: `ZAN_WORKSPACE_API_KEY must be at least ${MIN_KEY_LENGTH} characters` };
  }

  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    return { mode: "off", reason: "ZAN_WORKSPACE_URL is not a valid URL" };
  }
  // The key travels in a header, so anything but https outside a local
  // machine would put it on the wire in the clear.
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && LOCAL_HOSTS.has(parsed.hostname))) {
    return { mode: "off", reason: "ZAN_WORKSPACE_URL must use https (http is allowed for localhost only)" };
  }
  if (parsed.search || parsed.hash) {
    return { mode: "off", reason: "ZAN_WORKSPACE_URL must not carry a query string or #fragment" };
  }

  // Origin plus any path prefix ("https://host/v1"), without a trailing slash,
  // so an endpoint path is appended to it rather than replacing the prefix.
  return { mode: "live", baseUrl: `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`, apiKey };
}

/**
 * Read on every call rather than cached, so a value changed in the host's
 * dashboard takes effect on the next cold start without a code change. The
 * misconfiguration warning is logged once per process.
 */
export function getWorkspaceConfig(): WorkspaceConfig {
  const config = read();
  if (!reported && config.mode !== "live") {
    reported = true;
    if (config.mode === "off") {
      logger.warn({ reason: config.reason }, "workspace: off; leads and sign-ups are not sent to zan-workspace");
    } else {
      logger.info({}, "workspace: dry run; leads and sign-ups are logged, not sent to zan-workspace");
    }
  }
  return config;
}

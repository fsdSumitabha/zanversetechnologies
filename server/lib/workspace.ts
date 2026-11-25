import { getWorkspaceEnv } from "../config/env";

/* ═══════════════════════════════════════════════════════════════════════════
   ZAN-WORKSPACE — every call this site makes to the company's CRM.

   One base URL and one key for all of them (ZAN_WORKSPACE_URL and
   ZAN_WORKSPACE_API_KEY), so a new integration is a path in WORKSPACE_PATHS
   and a function that posts to it. Server to server only: the key never
   reaches a browser.

   ── WHAT EVERY REQUEST CARRIES ─────────────────────────────────────────────

     POST <ZAN_WORKSPACE_URL><path>
     Content-Type: application/json
     x-api-key: <ZAN_WORKSPACE_API_KEY>

   ── WHAT zan-workspace SHOULD DO ON EVERY ROUTE UNDER /api/integrations/zanverse

     - Check x-api-key against its own copy of the key with a timing-safe
       compare, the way src/lib/security/timingSafeKey.ts does, and refuse
       every request when its copy is not set.
     - Keep this key apart from CLIENT_PORTAL_API_KEY. That one ships in a
       browser bundle and is not a secret; this one is, so it guards routes
       of their own, never the /api/public ones.
     - Answer 2xx when the work is done. Anything else counts as failed.

   No redirect is followed: fetch would carry x-api-key to wherever it
   pointed. So the base URL has to be the final one, https included.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The routes this site calls, under ZAN_WORKSPACE_URL. Each one is written in
 * zan-workspace, under one folder, so one guard can cover them all.
 */
export const WORKSPACE_PATHS = {
  /** Newsletter sign-ups. See server/services/newsletter.service.ts for the body. */
  newsletter: "/api/integrations/zanverse/newsletter",
} as const;

/** How long zan-workspace has to answer, unless a caller says otherwise. */
const TIMEOUT_MS = 8000;

/** ZAN_WORKSPACE_URL and ZAN_WORKSPACE_API_KEY are not set. */
export class WorkspaceNotConnected extends Error {
  constructor() {
    super("ZAN_WORKSPACE_URL and ZAN_WORKSPACE_API_KEY are not set");
  }
}

/** zan-workspace answered, with something other than 2xx. */
export class WorkspaceRefused extends Error {
  constructor(
    readonly path: string,
    readonly status: number,
  ) {
    super(`zan-workspace answered ${status} on ${path}`);
  }
}

/**
 * Whether the two settings are there. Throws when only one is, or a value is
 * wrong (getWorkspaceEnv), so a half-done setup shows in the log.
 */
export function workspaceConnected(): boolean {
  return getWorkspaceEnv() !== null;
}

/**
 * POST a JSON body to a zan-workspace route, with the key.
 *
 * Resolves with the response once zan-workspace answers 2xx. Rejects with
 * WorkspaceNotConnected, WorkspaceRefused, or the network's own error
 * (a timeout included).
 */
export async function postToWorkspace(path: string, body: unknown, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const env = getWorkspaceEnv();
  if (!env) throw new WorkspaceNotConnected();

  const response = await fetch(`${env.ZAN_WORKSPACE_URL.replace(/\/+$/, "")}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": env.ZAN_WORKSPACE_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) throw new WorkspaceRefused(path, response.status);
  return response;
}

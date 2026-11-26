import { SITE, getWorkspaceConfig } from "../config/workspace";
import { logger } from "../config/logger";

/* ═══════════════════════════════════════════════════════════════════════════
   ZAN-WORKSPACE CLIENT — every request this site makes to zan-workspace.

   The same file is in zanverse-technologies. One function, so every call is
   authenticated, timed out, retried and logged the same way.

   Every request carries:

     Authorization:    Bearer ${ZAN_WORKSPACE_API_KEY}
     Accept:           application/json
     Content-Type:     application/json        when there is a body
     Idempotency-Key:  <the record's id>       when given
     User-Agent:       <site id>-site

   No redirect is followed. fetch would carry the key to wherever it
   pointed, so ZAN_WORKSPACE_URL has to be the final address, https
   included.

   Time. Each call has a budget (8 seconds unless the caller asks for less)
   and each attempt at most 4 seconds of it. A form route that also sends
   mail asks for less, so the whole route stays inside the host's 10-second
   function limit.

   Retries. One retry, after a short pause, on a network error, a timeout or
   429/502/503/504, when the budget still has room for it and repeating the
   request cannot do anything twice: a GET, or a write that carries an
   Idempotency-Key for zan-workspace to deduplicate on. zan-workspace answers
   a repeat with the first answer, or 409 while the first attempt is still
   saving.

   Answers come back as a result, never a throw:

     2xx        { ok: true, status, data }   data is the parsed JSON, or null
     401 / 403  unauthorised   the key was refused (logged as an error)
     404        not_found
     409        conflict       the same id is already being saved
     other 4xx  rejected       the request itself was refused (logged)
     5xx, network, timeout     unavailable
     no config  not_configured
   ═══════════════════════════════════════════════════════════════════════════ */

export type WorkspaceMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type WorkspaceFailure = "not_configured" | "unauthorised" | "not_found" | "conflict" | "rejected" | "unavailable";

export type WorkspaceResult<T> =
  | { ok: true; status: number; data: T | null }
  | { ok: false; reason: WorkspaceFailure; status?: number };

export interface WorkspaceRequestOptions {
  method?: WorkspaceMethod;
  /** Sent as JSON. */
  body?: unknown;
  /** Appended as a query string; undefined values are left out. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Lets zan-workspace deduplicate a write, and makes it safe to retry. */
  idempotencyKey?: string;
  /** The most the whole call may take, retry included. */
  budgetMs?: number;
}

const ATTEMPT_TIMEOUT_MS = 4000;
const DEFAULT_BUDGET_MS = 8000;
const RETRY_DELAY_MS = 400;
/** A retry with less time than this left is not worth starting. */
const MIN_ATTEMPT_MS = 1500;
const RETRYABLE = new Set([429, 502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    // An empty or non-JSON body.
    return null;
  }
}

function failureFor(status: number): WorkspaceFailure {
  if (status === 401 || status === 403) return "unauthorised";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status >= 400 && status < 500) return "rejected";
  return "unavailable";
}

/**
 * One request to zan-workspace. `path` is a path under ZAN_WORKSPACE_URL,
 * normally one of WORKSPACE_ENDPOINTS. Only a live configuration sends
 * anything; in a dry run or with nothing configured the answer is
 * `not_configured`.
 */
export async function workspaceRequest<T = unknown>(
  path: `/${string}`,
  { method = "GET", body, query, idempotencyKey, budgetMs = DEFAULT_BUDGET_MS }: WorkspaceRequestOptions = {},
): Promise<WorkspaceResult<T>> {
  const config = getWorkspaceConfig();
  if (config.mode !== "live") return { ok: false, reason: "not_configured" };

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) search.set(key, String(value));
  }
  const url = `${config.baseUrl}${path}${search.size ? `?${search}` : ""}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${config.apiKey}`,
    "User-Agent": `${SITE.id}-site`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const payload = body === undefined ? undefined : JSON.stringify(body);

  const canRetry = method === "GET" || Boolean(idempotencyKey);
  const deadline = Date.now() + budgetMs;
  // What the log lines name: the path, and the key if there is one. Never the
  // body, which is someone's contact details.
  const ref = { method, path, id: idempotencyKey };

  for (let attempt = 1; ; attempt++) {
    const timeoutMs = Math.min(ATTEMPT_TIMEOUT_MS, deadline - Date.now());
    // Another attempt only when the rules allow one and there is time for it.
    const mayRetry = () => canRetry && attempt === 1 && deadline - Date.now() - RETRY_DELAY_MS >= MIN_ATTEMPT_MS;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: payload,
        signal: AbortSignal.timeout(Math.max(timeoutMs, 1)),
        cache: "no-store",
        redirect: "error",
      });
    } catch (error) {
      // fetch reports a refused connection as TypeError("fetch failed") with
      // the reason in `cause`, and the timeout as a TimeoutError.
      const cause = error instanceof Error ? (error.cause as { code?: string } | undefined)?.code : undefined;
      logger.warn(
        { ...ref, attempt, err: error instanceof Error ? error.name : String(error), cause },
        "workspace: request failed",
      );
      if (!mayRetry()) return { ok: false, reason: "unavailable" };
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    if (response.ok) return { ok: true, status: response.status, data: await readJson<T>(response) };

    if (RETRYABLE.has(response.status) && mayRetry()) {
      logger.warn({ ...ref, status: response.status }, "workspace: retrying");
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    const reason = failureFor(response.status);
    if (reason !== "conflict") {
      // zan-workspace's own words for what was wrong. They hold no contact
      // details: it never repeats the body back.
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      logger.error(
        { ...ref, status: response.status, detail },
        reason === "unauthorised"
          ? `workspace: refused; check ZAN_WORKSPACE_API_KEY here and ${SITE.keyInWorkspace} in zan-workspace`
          : "workspace: request refused",
      );
    }
    return { ok: false, reason, status: response.status };
  }
}

/** Fetch from zan-workspace. Retried once on a network error or a 5xx. */
export const workspaceGet = <T = unknown>(path: `/${string}`, query?: WorkspaceRequestOptions["query"]) =>
  workspaceRequest<T>(path, { method: "GET", query });

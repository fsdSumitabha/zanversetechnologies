import { site } from "@/constants/zan";
import { isLocalPath } from "./http";

/* ───────────────────────────────────────────────────────────────────────────
   WHERE A POST CAME FROM

   For the public forms' routes (app/api/leads, app/api/newsletter). Any page on
   the web can point a plain <form> at either address and submit it from its own
   visitor's browser, so both refuse a browser post from another site before
   they do anything else, and both send a refused or finished plain post back
   only to a checked path on this site.
   ─────────────────────────────────────────────────────────────────────────── */

export function httpUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** The names this site answers to. Another site's page cannot set any of these on a post. */
export function ownHosts(request: Request): Set<string> {
  const hosts = new Set([new URL(site.url).host, new URL(request.url).host]);
  for (const header of ["host", "x-forwarded-host"]) {
    const value = request.headers.get(header)?.split(",")[0].trim().toLowerCase();
    if (value) hosts.add(value);
  }
  return hosts;
}

/**
 * Whether a browser sent this from another site's page. The browser writes both
 * headers and a page cannot change them. "same-site" is a sibling subdomain, which
 * has no form of ours either: the forms post to their own origin. A caller with
 * neither header is not a browser on someone else's page, and it passes: an agent
 * or a script speaks for itself, and the limits still apply to it.
 */
export function fromAnotherSite(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "cross-site" || fetchSite === "same-site";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const from = httpUrl(origin);
  return !from || !ownHosts(request).has(from.host);
}

/**
 * The Referer as a URL, only when it names this site and its path stays on this
 * site once it is a Location. Null for anything else.
 */
export function ownReferer(request: Request): URL | null {
  const from = httpUrl(request.headers.get("referer"));
  if (!from || !ownHosts(request).has(from.host) || !isLocalPath(from.pathname)) return null;
  return from;
}

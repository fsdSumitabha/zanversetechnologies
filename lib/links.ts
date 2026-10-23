/* ───────────────────────────────────────────────────────────────────────────
   LINKS

   Every page this site links to lives in this site: the services index and its
   sixteen service pages, portfolio, how we work, about, our team, contact and
   the five policy pages are all routes under app/. A content href
   ("/services") is used exactly as written.

   The one thing that needs resolving is an in-page anchor. "#contact" is a
   section of the homepage, and the navbar, mega menu and footer that carry it
   are on every page, so away from the homepage it has to become "/#contact".
   That needs the current path, so it lives in the `useSiteHref` hook next door
   in lib/useSiteHref.ts. THIS module stays free of React so server components
   can import it; keep it that way.

   tel:, mailto: and http(s): links pass through untouched.
   ─────────────────────────────────────────────────────────────────────────── */

/** A path on this site, so it can be navigated with next/link. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Resolves an href that came from constants against the page it is rendered
 * on. Pure, so anything that knows its own path can call it.
 *
 *   siteHref("#contact", "/")          -> "#contact"
 *   siteHref("#contact", "/services")  -> "/#contact"
 *   siteHref("/services", "/about-us") -> "/services"
 */
export function siteHref(path: string, pathname: string = "/"): string {
  if (path.startsWith("#")) return pathname === "/" ? path : `/${path}`;
  return path;
}

/** WhatsApp chat with the brand name in the greeting, as on the old site. */
export function waLink(number: string, brandName: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(`Hi ${brandName}! I'm interested in your services.`)}`;
}

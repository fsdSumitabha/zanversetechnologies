import type { Metadata } from "next";
import SiteLayout, { metadata as siteMetadata } from "./(site)/layout";
import NotFound, { metadata as notFoundMetadata } from "./(site)/not-found";

export { viewport } from "./(site)/layout";

/* ═══════════════════════════════════════════════════════════════════════════
   THE 404 FOR URLS THAT MATCH NO ROUTE

   The site and the agent console have separate root layouts, so there is no
   single layout above app/ for an unmatched URL to render in. Without this
   file (and experimental.globalNotFound in next.config.ts) Next falls back to
   a bare built-in document: no fonts, no styles, no navbar.

   So this renders the site's own not-found page inside the site's own layout.
   notFound() thrown from a site page does not come here; it finds
   app/(site)/not-found.tsx under the same layout by the usual route.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The merge Next would do if the site layout sat above this file: key by key, page wins. */
export const metadata: Metadata = { ...siteMetadata, ...notFoundMetadata };

export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   WHEN EACH PAGE LAST REALLY CHANGED

   The sitemap's lastmod, the structured data's dateModified and the "Last
   updated" line on a page all read this, so the three cannot disagree. Move a
   date only when that page's content really changes: a date stamped on every
   build tells crawlers nothing, and they learn to ignore it.

   Free of React and of the page content, so anything can import it.
   ─────────────────────────────────────────────────────────────────────────── */

/** The rewrite of the service pages and the main pages. */
export const CONTENT_UPDATED = "2026-11-05";

/** The effective date of the five policies, as they state it (constants/legal.ts). */
const LEGAL_UPDATED = "2026-10-23";

const LEGAL_PATHS: readonly string[] = [
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/cookie-policy",
  "/disclaimer",
];

/** The ISO date a path's content last changed. */
export function pageUpdated(path: string): string {
  return LEGAL_PATHS.includes(path) ? LEGAL_UPDATED : CONTENT_UPDATED;
}

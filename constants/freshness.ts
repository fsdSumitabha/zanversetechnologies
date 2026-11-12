/* ───────────────────────────────────────────────────────────────────────────
   WHEN EACH PAGE LAST REALLY CHANGED

   The sitemap's lastmod, the structured data's dateModified and the "Last
   updated" line on a page all read this, so the three cannot disagree. Move a
   date only when that page's content really changes: a date stamped on every
   build tells crawlers nothing, and they learn to ignore it.

   A page's date also versions its share card (lib/metadata.ts `shareImage`).
   The card draws the page's search title and is cached for a year under its
   URL, so a page whose search title changes has to move its date here, or the
   old card keeps showing wherever the page is shared.

   Free of React and of the page content, so anything can import it.
   ─────────────────────────────────────────────────────────────────────────── */

/** The rewrite of the service pages and the main pages. */
export const CONTENT_UPDATED = "2026-11-05";

/** The effective date the policies state (constants/legal.ts). A policy whose
    text has changed since has its own line in `CHANGED` below. */
const LEGAL_UPDATED = "2026-10-23";

const LEGAL_PATHS: readonly string[] = [
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/cookie-policy",
  "/disclaimer",
];

/**
 * The pages whose content changed after the dates above, each on one line with
 * the day it did and what changed. When a page changes again, its line takes
 * the new day. A policy's date here is the effective date it states, so the two
 * move together.
 *
 * Naming or changing a page's reviewer (constants/reviewers.ts) is not a change
 * to its content, and moves no date.
 */
const CHANGED: Readonly<Record<string, string>> = {
  /* 10 November 2026, the owner's decisions of that day. */
  // The homepage's services deck lists "AI Agents" among the AI service's
  // capabilities, and its Markdown copy gives the director's approved line.
  "/": "2026-11-10",
  // A new question: is the company part of Zan Services?
  "/about-us": "2026-11-10",
  // The director's approved line on his card.
  "/our-team": "2026-11-10",
  // A search title and description that name AI agents (so a new share
  // card), and "AI Agents" in the list of what is included.
  "/services/ai-machine-learning": "2026-11-10",
  // §6: three months of support for bug fixes. Effective November 10, 2026.
  "/refund-policy": "2026-11-10",
};

/** The ISO date a path's content last changed. */
export function pageUpdated(path: string): string {
  return CHANGED[path] ?? (LEGAL_PATHS.includes(path) ? LEGAL_UPDATED : CONTENT_UPDATED);
}

/**
 * When /data/company.json last changed. It is no one page, so it has its own
 * date. 10 November 2026: the parent company, the Google listing, all five
 * figures and the director's line. (services.json and faqs.json take the
 * newest date of the pages they draw from, in lib/siteData.ts.)
 */
export const COMPANY_DATA_UPDATED = "2026-11-10";

/** The newest of some ISO dates. They sort as text. */
export const newest = (dates: readonly string[]): string =>
  dates.reduce((a, b) => (b > a ? b : a), CONTENT_UPDATED);

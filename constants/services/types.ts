import type { FAQ } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   THE COPY OF ONE SERVICE PAGE

   One file per service in this folder, read by the page template in
   app/(site)/services/[...slug]/page.tsx and by lib/siteData.ts. It lives apart
   from constants/pages.ts because client components import that file, and this
   copy must stay out of the browser bundle.

   Keyword research: docs/SEO_KEYWORDS_LEAN.md and docs/SEO_KEYWORDS.md.
   ─────────────────────────────────────────────────────────────────────────── */

/** A link to another page of this site, or to a guide. */
export interface ContentLink {
  label: string;
  /** A path on this site, for example "/services/web-development". */
  href: string;
}

/** An outside source a claim on the page rests on. Read it before citing it. */
export interface SourceLink {
  label: string;
  /** A full https:// URL. */
  href: string;
}

export interface ContentSection {
  /** The section's h2. A real search phrase where one reads naturally. */
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  /** Related pages, shown as "See also" under the section. */
  links?: readonly ContentLink[];
}

export interface ServiceContent {
  /** The page's h1, with the main search phrase and the place. */
  h1: string;
  /** Without the company name. At most 37 characters, so the title stays under 62. */
  seoTitle: string;
  /** At most 160 characters. */
  seoDescription: string;
  /** The opening under the h1: one or two plain sentences saying who, what and where. */
  lead: string;
  sections: readonly ContentSection[];
  /** Added after any existing question set the page already has. */
  faqs: readonly FAQ[];
  sources?: readonly SourceLink[];
}

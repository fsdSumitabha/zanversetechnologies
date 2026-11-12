import type { FAQ } from "@/constants/zan";
import type { ContentLink, ContentSection, SourceLink } from "@/constants/services/types";

/* One article under /guides. One file per guide in this folder, read by
   app/(site)/guides and lib/siteData.ts, and kept out of the browser bundle. */

export interface Guide {
  slug: string;
  /** The h1, usually the question people type. */
  title: string;
  /** Without the company name. At most 37 characters. */
  seoTitle: string;
  /** At most 160 characters. */
  seoDescription: string;
  /** The direct answer, in one or two sentences. */
  lead: string;
  /** One line for the list page. */
  summary: string;
  /** ISO dates. */
  published: string;
  updated: string;
  sections: readonly ContentSection[];
  faqs: readonly FAQ[];
  /** Outside sources the guide rests on, each one read before being cited. */
  sources: readonly SourceLink[];
  /** The service pages this guide supports. */
  services: readonly ContentLink[];
}

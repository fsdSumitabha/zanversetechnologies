import "server-only";

import { guide as googleAdsBudgetDubai } from "./google-ads-budget-dubai";
import { guide as seoAeoGeoExplained } from "./seo-aeo-geo-explained";
import type { Guide } from "./types";
import { guide as websiteCostDubai } from "./website-cost-dubai";
import { guide as whatIsASmartContract } from "./what-is-a-smart-contract";
import { guide as whatIsAnAiAgent } from "./what-is-an-ai-agent";
import { guide as whatIsVapt } from "./what-is-vapt";

/* ───────────────────────────────────────────────────────────────────────────
   THE GUIDES, in the order /guides lists them

   Read by the two guide routes (app/(site)/guides), the sitemap, the share cards
   (app/og) and lib/siteData.ts. Server only, for the reason in
   constants/services/index.ts. A new guide is one file in this folder and one
   line here: its route, its sitemap entry, its share card and its Markdown copy
   all come from this list.
   ─────────────────────────────────────────────────────────────────────────── */

export const guides: readonly Guide[] = [
  websiteCostDubai,
  seoAeoGeoExplained,
  whatIsVapt,
  whatIsASmartContract,
  whatIsAnAiAgent,
  googleAdsBudgetDubai,
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

/* ───────────────────────────────────────────────────────────────────────────
   WHO REVIEWS EACH PAGE

   THE OWNER'S TO CHANGE, ONE LINE PER PAGE: the page's path, and the `id` of
   the colleague who reviews it, from `everyone` in constants/zan.ts. The
   owner set these pairs on 10 November 2026, the day the bios they rest on
   were approved. To give a page another reviewer, change the id on its line.
   To name nobody, delete the line.

   Every page that ends on a "Last updated" line has a line here: the standing
   pages that carry one, the service pages and the guides. A new service page
   or guide needs its own line, or it credits the team. The homepage and the
   five policies have no such line, so they are not here.

   One list, three readers, so they always name the same person:
     - the line at the foot of the page, "Last updated 5 November 2026.
       Reviewed by Nadim Ali, Director.", where the name opens that person's
       card on /our-team (components/zan/page/ContentBlocks.tsx `UpdatedLine`);
     - the page's structured data: `reviewedBy` on its WebPage, and `author`
       on a guide's Article (lib/schema.ts);
     - the page's Markdown copy (lib/markdown.ts).

   A path missing here, or an id that `everyone` does not have, names nobody.
   The line then credits the team and the markup the company, so a slip here
   shows no name rather than breaking the page.

   Naming or changing a reviewer is not a change to the page's content, so it
   moves no date in constants/freshness.ts.
   ─────────────────────────────────────────────────────────────────────────── */

import { everyone, type Person } from "@/constants/zan";

/** A colleague's `id` in constants/zan.ts. A new colleague's id goes here too. */
type PersonId = "nadim" | "karthikeyan" | "sumitabha" | "sribabu" | "saransh" | "ronit";

const reviewers: Readonly<Record<string, PersonId>> = {
  /* The standing pages. */
  "/about-us": "nadim",
  "/contact-us": "nadim",
  "/how-we-work": "nadim",
  "/our-team": "nadim",
  "/portfolio": "nadim",
  "/services": "nadim",
  "/guides": "nadim",

  /* Development. */
  "/services/web-development": "sumitabha",
  "/services/mobile-apps": "sumitabha",
  "/services/ai-machine-learning": "nadim",
  "/services/blockchain-web3": "karthikeyan",
  "/services/cloud-devops": "sumitabha",
  "/services/cybersecurity": "nadim",

  /* Digital marketing. */
  "/services/digital-marketing": "saransh",
  "/services/digital-marketing/seo-aeo-geo": "saransh",
  "/services/digital-marketing/performance-marketing": "ronit",
  "/services/digital-marketing/social-media-management": "saransh",
  "/services/digital-marketing/influencer-marketing": "saransh",

  /* Branding and design. */
  "/services/branding-and-designing": "saransh",
  "/services/branding-and-designing/ui-ux-design": "sumitabha",
  "/services/branding-and-designing/brand-identity-design": "saransh",
  "/services/branding-and-designing/graphic-design": "saransh",
  "/services/branding-and-designing/website-design": "sumitabha",

  /* The guides, in the order /guides lists them. */
  "/guides/website-cost-dubai": "sumitabha",
  "/guides/seo-aeo-geo-explained": "saransh",
  "/guides/what-is-vapt": "nadim",
  "/guides/what-is-a-smart-contract": "karthikeyan",
  "/guides/what-is-an-ai-agent": "nadim",
  "/guides/google-ads-budget-dubai": "ronit",
};

/** The colleague who reviews a page, or undefined for a page with none. */
export function reviewerFor(path: string): Person | undefined {
  const id = reviewers[path];
  return id ? everyone.find((person) => person.id === id) : undefined;
}

/**
 * The address of a person's card: /our-team gives every card the person's id
 * as its anchor (components/zan/team/TeamPageCard.tsx), so /our-team#nadim
 * opens on the director's card.
 */
export const teamCardPath = (person: Person) => `/our-team#${person.id}`;

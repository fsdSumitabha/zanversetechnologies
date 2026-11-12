import "server-only";

import { content as aiMachineLearning } from "./ai-machine-learning";
import { content as blockchainWeb3 } from "./blockchain-web3";
import { content as brandIdentityDesign } from "./brand-identity-design";
import { content as brandingAndDesigning } from "./branding-and-designing";
import { content as cloudDevops } from "./cloud-devops";
import { content as cybersecurity } from "./cybersecurity";
import { content as digitalMarketing } from "./digital-marketing";
import { content as graphicDesign } from "./graphic-design";
import { content as influencerMarketing } from "./influencer-marketing";
import { content as mobileApps } from "./mobile-apps";
import { content as performanceMarketing } from "./performance-marketing";
import { content as seoAeoGeo } from "./seo-aeo-geo";
import { content as socialMediaManagement } from "./social-media-management";
import type { ServiceContent } from "./types";
import { content as uiUxDesign } from "./ui-ux-design";
import { content as webDevelopment } from "./web-development";
import { content as websiteDesign } from "./website-design";

/* ───────────────────────────────────────────────────────────────────────────
   THE COPY OF THE SIXTEEN SERVICE PAGES, by `priceKey`

   Read by the page template (app/(site)/services/[...slug]/page.tsx), the share
   cards (app/og) and lib/siteData.ts. Nothing else imports this.

   SERVER ONLY, which the first line makes a build error to break. This is all
   the words of sixteen pages. constants/pages.ts is in the browser bundle, so it
   and every client component must stay away from this file.
   ─────────────────────────────────────────────────────────────────────────── */

export const serviceContent: Record<string, ServiceContent> = {
  "web-development": webDevelopment,
  "mobile-apps": mobileApps,
  "ai-machine-learning": aiMachineLearning,
  "blockchain-web3": blockchainWeb3,
  "cloud-devops": cloudDevops,
  cybersecurity,
  "digital-marketing": digitalMarketing,
  "branding-and-designing": brandingAndDesigning,
  "seo-aeo-geo": seoAeoGeo,
  "performance-marketing": performanceMarketing,
  "social-media-management": socialMediaManagement,
  "influencer-marketing": influencerMarketing,
  "ui-ux-design": uiUxDesign,
  "brand-identity-design": brandIdentityDesign,
  "graphic-design": graphicDesign,
  "website-design": websiteDesign,
};

/** One page's copy. Undefined only for a page added before its copy file is. */
export function getServiceContent(priceKey: string): ServiceContent | undefined {
  return serviceContent[priceKey];
}

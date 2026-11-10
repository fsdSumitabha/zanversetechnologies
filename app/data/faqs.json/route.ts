import { faqsData, PUBLIC_HEADERS } from "@/lib/siteData";

/* Every question set the site publishes, by topic, for agents. Built once, at
   build time, from the same constants the pages render (lib/siteData.ts). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(faqsData(), { headers: PUBLIC_HEADERS });
}

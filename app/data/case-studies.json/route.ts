import { caseStudiesData, PUBLIC_HEADERS } from "@/lib/siteData";

/* The published case studies, for agents. Built once, at build time, from the
   same constants the pages render (lib/siteData.ts). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(caseStudiesData(), { headers: PUBLIC_HEADERS });
}

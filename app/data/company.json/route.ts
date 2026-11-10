import { companyData, PUBLIC_HEADERS } from "@/lib/siteData";

/* Who the company is, where it is and how to reach it, for agents. Built once,
   at build time, from the same constants the pages render (lib/siteData.ts). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(companyData(), { headers: PUBLIC_HEADERS });
}

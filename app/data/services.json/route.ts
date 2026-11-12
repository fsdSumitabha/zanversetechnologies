import { PUBLIC_HEADERS, servicesData } from "@/lib/siteData";

/* Every service page's text, for agents. Built once, at build time, from the
   same constants the pages render (lib/siteData.ts). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(servicesData(), { headers: PUBLIC_HEADERS });
}

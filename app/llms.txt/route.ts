import { llmsTxt } from "@/lib/markdown";
import { PUBLIC_HEADERS } from "@/lib/siteData";

/* The short map of the site for AI tools, in the llms.txt format, written at
   build time from the same constants the pages render (lib/markdown.ts). */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), {
    headers: { ...PUBLIC_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
  });
}

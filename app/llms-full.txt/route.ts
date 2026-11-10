import { llmsFullTxt } from "@/lib/markdown";
import { PUBLIC_HEADERS } from "@/lib/siteData";

/* The text of every public page in one file, written at build time from the
   same constants the pages render (lib/markdown.ts). */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { ...PUBLIC_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
  });
}

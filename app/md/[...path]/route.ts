import { markdownFor, markdownParams, pathFromSegments } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/metadata";
import { SHARED_HEADERS } from "@/lib/siteData";

/* ───────────────────────────────────────────────────────────────────────────
   THE MARKDOWN COPY OF A PAGE

   /md/services/web-development, and /md/index for the homepage. Nobody is meant
   to type these. next.config.ts rewrites /services/web-development.md here, and
   netlify/edge-functions/markdown-negotiation.ts sends a request for the page
   itself with Accept: text/markdown here. All of them are built at build time
   (lib/markdown.ts), and any other address under /md is a 404.

   The canonical says the page is the one meant to rank. No noindex, unlike the
   other files for agents: the edge function serves this response at the page's
   own address, and a noindex there would tell a client that asked for Markdown
   to drop the page itself. Vary: Accept because the same words are a different
   answer to whoever asked for HTML.
   ─────────────────────────────────────────────────────────────────────────── */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return markdownParams();
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Ctx) {
  const path = pathFromSegments((await params).path);
  const body = markdownFor(path);
  if (body === undefined) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      ...SHARED_HEADERS,
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: `<${absoluteUrl(path)}>; rel="canonical"`,
    },
  });
}

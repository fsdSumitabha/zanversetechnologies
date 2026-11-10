/* ───────────────────────────────────────────────────────────────────────────
   A PAGE'S URL, ASKED FOR AS MARKDOWN

   A client that sends Accept: text/markdown to /services/web-development gets
   the Markdown copy (app/md/[...path]/route.ts). A browser never gets here: the
   `header` condition below means this function does not run at all without
   text/markdown in the request's Accept header.

   WHY AN EDGE FUNCTION. The live site answers pages from Netlify's durable
   cache, and Netlify-Vary does not include accept (checked with curl on
   5 November 2026). So this must never be a rewrite on the Accept header in
   next.config.ts or proxy.ts: if such a request were the first after a deploy,
   Next would answer with Markdown, Netlify would store that under / and serve it
   to every visitor for a year. People must never get Markdown.

   This runs in front of that cache and rewrites to the copy's own address, so
   the Markdown is fetched and cached as /md/... and never under the page's URL.

   Plain Web API types and no import of @netlify/edge-functions, which is not a
   dependency, because tsc reads this folder too. It cannot run locally under
   `next dev` or `next start`: check it after a deploy.
   ─────────────────────────────────────────────────────────────────────────── */

/** The q value a client gives a media type, or 0 if it does not name it. */
function quality(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [name, ...params] = part.split(";").map((piece) => piece.trim().toLowerCase());
    if (name !== type) continue;
    const q = params.find((param) => param.startsWith("q="));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return 0;
}

export default function markdownNegotiation(request: Request): URL | undefined {
  // Here and not in the config below: see the note there.
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;

  // The header condition only looks for the words. text/markdown;q=0, or HTML
  // named as the better of the two, still means the page itself.
  const accept = request.headers.get("accept") ?? "";
  const markdown = quality(accept, "text/markdown");
  if (markdown === 0 || markdown < quality(accept, "text/html")) return undefined;

  const { pathname } = new URL(request.url);
  const path = pathname === "/" ? "/index" : pathname.replace(/\/+$/, "");
  return new URL(`/md${path}`, request.url);
}

export const config = {
  path: "/*",
  /* Everything that is not a public page. "/*.*" is any URL with a dot in it:
     files, /robots.txt, /sitemap.xml, the .md addresses and /.well-known/*. /ae
     has to reach its redirect in next.config.ts. */
  excludedPath: [
    "/_next/*",
    "/api/*",
    "/data/*",
    "/md/*",
    "/og/*",
    "/images/*",
    "/lp/*",
    "/ae",
    "/ae/*",
    "/agent",
    "/agent/*",
    "/thank-you",
    "/*.*",
  ],
  /* NO `method`, although GET and HEAD are all this answers. The list Netlify
     validates its manifest against has no HEAD (@netlify/edge-bundler 14.10.3,
     which netlify-cli@26 runs), so ["GET", "HEAD"] here fails the whole deploy. And
     ["GET"] alone would leave a HEAD saying one thing and a GET another. */
  header: { accept: "text/markdown" },
};

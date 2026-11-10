import { site } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   ROBOTS

   A route rather than Next's app/robots.ts, because that one can only write the
   directives it knows: no comment naming /llms.txt, and no comment for the
   content signal.

   Carried over from the previous builds, including the explicit allows for
   the AI answer engines: being crawlable by ChatGPT, Perplexity and Claude is
   part of what the GEO service on /services/digital-marketing/seo-aeo-geo
   sells, so the site has to practise it. Google-Extended and
   Applebot-Extended are the AI-training opt-ins for Gemini and Apple
   Intelligence and are listed for the same reason.

   TRAINING IS ALLOWED (GEO 9). On 10 November 2026 the owner decided that AI
   companies may train on this site's content. So the training crawlers are
   let in, as they always were, and CONTENT_SIGNAL says ai-train=yes, here and
   in the Content-Signal header in next.config.ts. To reverse that and keep
   the answers: in AI_CRAWLERS give GPTBot, ClaudeBot, Google-Extended,
   Applebot-Extended, meta-externalagent, Bytespider and CCBot `Disallow: /`,
   keep ChatGPT-User, OAI-SearchBot, PerplexityBot and Claude-User as they are,
   and change ai-train=yes to ai-train=no in both places.

   NOTE: this file does not decide whether a page is indexed. A meta tag or an
   X-Robots-Tag does that, per page: the /lp pages, /thank-you and /agent carry a
   noindex, and they have to stay crawlable here, or a crawler could never read
   it and any of those URLs that picked up a link could still surface as a bare
   listing.

   NO Host LINE. Google ignores it.
   ─────────────────────────────────────────────────────────────────────────── */

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
  "CCBot",
];

const SEARCH_CRAWLERS = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit"];

/**
 * The API routes in app/api: the website chat, the agent console's endpoints,
 * the leads route, the Pusher auth and the WhatsApp webhook. They answer this
 * site's own scripts and Meta's servers, not readers, so there is nothing to
 * index; crawling them wastes budget and, for /api/chat/session, creates a
 * conversation per request. The public data lives under /data for this reason.
 */
const PRIVATE = "/api/";

/* A comment, on purpose. Lighthouse's robots check fails a file with a directive
   it does not know, and that takes the page's SEO score below 100. The working
   signal is the Content-Signal response header in next.config.ts. Keep the two
   in step: search, AI answers and AI training are all yes. */
const CONTENT_SIGNAL = "# Content-Signal: search=yes, ai-input=yes, ai-train=yes";

const group = (userAgent: string, ...extra: string[]) =>
  [`User-Agent: ${userAgent}`, ...extra, "Allow: /", `Disallow: ${PRIVATE}`].join("\n");

const body = [
  `# ${site.name}. A short map of this site for AI tools: ${site.url}/llms.txt`,
  ...[...SEARCH_CRAWLERS, ...AI_CRAWLERS].map((userAgent) => group(userAgent)),
  `${CONTENT_SIGNAL}\n${group("*")}`,
  `Sitemap: ${site.url}/sitemap.xml`,
].join("\n\n");

export const dynamic = "force-static";

export function GET() {
  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

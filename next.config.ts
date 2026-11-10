import path from "node:path";
import type { NextConfig } from "next";

/* ── What the site and landing pages really load, as a report-only policy ─────
   Report-only blocks nothing. A browser logs what falls outside the list, and
   there is no endpoint to send that to, so it only shows in the console of
   whoever is looking. The point is to see a clean console now, so the same list
   can be enforced one day, which is what limits an injected script.

   'unsafe-inline' for scripts, because Next's own inline payloads, the
   preloader's skip script and the consent bootstrap (Analytics.tsx) all run on
   prerendered pages, which cannot carry a per-request nonce.
   'wasm-unsafe-eval', and blob: for workers and fetch, for the laptop model:
   three's DRACOLoader starts its decoder as a blob: worker, the worker compiles
   /draco/draco_decoder.wasm, and GLTFLoader reads the model's textures back
   through blob: URLs. 'unsafe-eval' is development only: React needs it there,
   and nothing in the production chunks calls eval.

   The hosts are the four tags in components/zan/analytics/TagLoader.tsx and what
   those scripts call in turn, checked against the live GTM container on
   5 November 2026, plus GTM's Preview mode and Pusher for the chat. Adding a tag
   in GTM that loads from a new host means adding the host here. Google Ads can
   also write to the visitor's own country's Google domain, so www.google.ae is
   listed, and another country's would log a line in that visitor's console.

   NOT HERE: upgrade-insecure-requests. Chrome logs an error for it on every page
   of a report-only policy. */
const GOOGLE_TAGS = [
  "https://www.googletagmanager.com",
  "https://www.googleadservices.com",
  "https://www.google.com",
  "https://www.google.ae",
  "https://googleads.g.doubleclick.net",
] as const;

const REPORT_ONLY_POLICY = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
    ...(process.env.NODE_ENV === "production" ? [] : ["'unsafe-eval'"]),
    ...GOOGLE_TAGS,
    "https://cct.google",
    "https://connect.facebook.net",
    "https://snap.licdn.com",
    "https://js.pusher.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "img-src 'self' data: blob:",
    ...GOOGLE_TAGS,
    "https://*.google-analytics.com",
    "https://*.doubleclick.net",
    "https://pagead2.googlesyndication.com",
    "https://www.gstatic.com",
    "https://ssl.gstatic.com",
    "https://www.facebook.com",
    "https://*.ads.linkedin.com",
    "https://www.linkedin.com",
  ].join(" "),
  [
    "connect-src 'self' blob:",
    ...GOOGLE_TAGS,
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.doubleclick.net",
    "https://adservice.google.com",
    "https://pagead2.googlesyndication.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://*.ads.linkedin.com",
    "https://www.linkedin.com",
    "https://*.pusher.com",
    "wss://*.pusher.com",
  ].join(" "),
  "frame-src 'self' https://www.googletagmanager.com https://*.doubleclick.net https://www.google.com https://www.facebook.com https://tagassistant.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  // Meta's pixel can post a large event through a form of its own.
  "form-action 'self' https://www.facebook.com",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768],
    // Every image is served from /public. No remote hosts are allowed, so a
    // stray third-party URL fails loudly instead of quietly loading someone
    // else's asset.
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "gsap", "lucide-react", "@react-three/drei", "lenis"],
    // The site and the agent console have separate root layouts, so unmatched
    // URLs need app/global-not-found.tsx to get the site's 404 and chrome.
    globalNotFound: true,
  },
  turbopack: {
    // Pinned to this folder, so Turbopack never infers a parent folder as the
    // workspace root. Next picks the root from the lockfiles it finds above
    // the project, and when one of those won, Turbopack watched the wrong tree
    // and kept serving a stale app/globals.css long after the file had been
    // rewritten.
    root: path.join(__dirname),
  },
  /* Whether the enquiry forms can send, for lib/leads.ts. Compiled into the
     bundle as a yes or no: the password itself is only ever read on the server.
     A client component cannot read SMTP_PASS, and most pages are prerendered, so
     a build is where this has to be decided. */
  env: {
    NEXT_PUBLIC_LEADS_READY: process.env.SMTP_USER && process.env.SMTP_PASS ? "true" : "false",
  },
  /* The API is this project's own: /api/chat/*, /api/leads, /api/pusher/auth,
     /api/agent/* and the WhatsApp webhook are all implemented in app/api, over
     this site's Mongo, Gemini, Pusher, Meta and SMTP credentials. Nothing is
     rewritten to another host, which is also what keeps the rate limiter honest. A
     server-side rewrite would present every visitor to the upstream as one
     IP, so a per-IP limit ("20 chat sessions per 5 minutes") would apply to
     the whole site at once. Requests arrive directly instead, and clientIp()
     in server/lib/rateLimit.ts reads the caller from the host's trusted
     header. */

  /* ── The old /ae addresses ──────────────────────────────────────────────
     Before this build, zanversetechnologies.com redirected to
     zanservices.com/ae, where the UAE pages lived under an /ae prefix. Those
     are the pages this site now serves at bare paths, so an /ae address that
     is typed from memory, shared from the old site or rewritten onto this
     domain lands on the same page here instead of a 404: /ae -> /, and
     /ae/services/web-development -> /services/web-development.

     The bare /ae is its own rule so the homepage is "/" exactly, never a
     path built out of an empty parameter. Query strings are carried across
     by Next, so a tagged campaign link keeps its tags. */
  async redirects() {
    return [
      { source: "/ae", destination: "/", permanent: true },
      { source: "/ae/:path*", destination: "/:path*", permanent: true },
    ];
  },

  /* ── The Markdown copy of each page ─────────────────────────────────────
     /services/web-development.md is answered by app/md, as
     /md/services/web-development, and /index.md by /md/index. In beforeFiles, so
     /services/[...slug] and /lp/[slug] never see a .md address.

     NEVER REWRITE A PAGE'S OWN URL ON THE Accept HEADER, here or in proxy.ts.
     The live site answers pages from Netlify's durable cache, and Netlify-Vary
     does not include accept (checked with curl on 5 November 2026). If a request
     with Accept: text/markdown were the first after a deploy, the rewrite would
     answer with Markdown, and Netlify would store that under / and serve it to
     every visitor for a year. People must never get Markdown. A page's URL only
     answers in Markdown through netlify/edge-functions/markdown-negotiation.ts,
     which runs in front of that cache. */
  async rewrites() {
    return {
      beforeFiles: [{ source: "/:path(.*)\\.md", destination: "/md/:path" }],
      afterFiles: [],
      fallback: [],
    };
  },

  async headers() {
    const longCache = "public, max-age=31536000, immutable";
    return [
      {
        source: "/:all*(woff2|woff|ttf|otf)",
        headers: [{ key: "Cache-Control", value: longCache }],
      },
      /* A year, but only for what Next itself answers. On Netlify the files in
         public/ are served by the CDN and never reach this rule: /images/* get
         their cache from netlify.toml. What it does reach there is the icons
         (/icon.png, /favicon.ico) and the share cards under /og, whose URLs
         carry a version query. Under `next start` it reaches public/ as well. */
      {
        source: "/:all*(png|jpg|jpeg|webp|avif|svg|gif|ico|glb|wasm)",
        headers: [{ key: "Cache-Control", value: longCache }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      /* Where an agent can find out about the site, from the homepage's own
         response. */
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby", </.well-known/api-catalog>; rel="api-catalog"',
          },
        ],
      },
      /* The console shows lead names and phone numbers, so no script on it may
         register a WebMCP tool, whatever gets into the page. */
      {
        source: "/agent/:path*",
        headers: [{ key: "Permissions-Policy", value: "tools=()" }],
      },
      /* The site and landing pages. Not the console, which loads none of this
         and has its own root layout, and not the API or Next's own files. */
      {
        source: "/((?!agent(?:/|$)|api/|_next/).*)",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_POLICY },
          /* What this site lets AI tools do with its content: search, answers,
             and training, which the owner allowed on 10 November 2026. It sits
             here and not in robots.txt, where it is only a comment:
             Lighthouse's robots check fails a file with a directive it does
             not know. Keep it in step with CONTENT_SIGNAL in
             app/robots.txt/route.ts, which says how to reverse the training
             decision. */
          { key: "Content-Signal", value: "search=yes, ai-input=yes, ai-train=yes" },
        ],
      },
    ];
  },
};

export default nextConfig;

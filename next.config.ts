import path from "node:path";
import type { NextConfig } from "next";

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
  /* The API is this project's own: /api/chat/*, /api/pusher/auth, /api/agent/*
     and the WhatsApp webhook are all implemented in app/api, over this site's
     Mongo, Gemini, Pusher and Meta credentials. Nothing is rewritten to
     another host, which is also what keeps the rate limiter honest. A
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

  async headers() {
    const longCache = "public, max-age=31536000, immutable";
    return [
      {
        source: "/:all*(woff2|woff|ttf|otf)",
        headers: [{ key: "Cache-Control", value: longCache }],
      },
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
    ];
  },
};

export default nextConfig;

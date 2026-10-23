import type { MetadataRoute } from "next";
import { siteRoutes } from "@/constants/pages";
import { absoluteUrl } from "@/lib/metadata";

/* ───────────────────────────────────────────────────────────────────────────
   SITEMAP

   Generated from constants/pages.ts `siteRoutes` — the same registry the rest
   of the site builds its navigation and its page templates from — so a URL can
   never be advertised here without a page behind it. That was an earlier
   build's core SEO failure: a sitemap full of URLs no crawler could render.

   One entry per route and no hreflang alternates: the site has one language
   and one market, and every page's canonical is its own URL. The URLs come
   from `absoluteUrl` (lib/metadata.ts), the helper each page's canonical is
   built from, so the sitemap and the page it points at always agree — down to
   the homepage being the bare origin, with no trailing slash.

   NO lastModified. Stamping `new Date()` on every entry at build time tells
   crawlers that every page on the site changed at the same instant — a signal
   Google learns to ignore, and then keeps ignoring once there is a real one.
   An absent <lastmod> is honest; a fabricated one is not.
   ─────────────────────────────────────────────────────────────────────────── */

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }));
}

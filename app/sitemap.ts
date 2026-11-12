import type { MetadataRoute } from "next";
import { pageUpdated } from "@/constants/freshness";
import { guides } from "@/constants/guides";
import { siteRoutes } from "@/constants/pages";
import { absoluteUrl } from "@/lib/metadata";

/* ───────────────────────────────────────────────────────────────────────────
   SITEMAP

   Generated from constants/pages.ts `siteRoutes` — the same registry the rest
   of the site builds its navigation and its page templates from — and from the
   guides in constants/guides, which that registry may not import. So a URL can
   never be advertised here without a page behind it. That was an earlier
   build's core SEO failure: a sitemap full of URLs no crawler could render.

   One entry per route and no hreflang alternates: the site has one language
   and one market, and every page's canonical is its own URL. The URLs come
   from `absoluteUrl` (lib/metadata.ts), the helper each page's canonical is
   built from, so the sitemap and the page it points at always agree — down to
   the homepage being the bare origin, with no trailing slash.

   lastModified IS THE DATE THE PAGE REALLY CHANGED: constants/freshness.ts, or
   the guide's own `updated`. The structured data and the "Last updated" line
   read the same dates. Never `new Date()`: stamping every entry at build time
   tells crawlers that every page on the site changed at the same instant — a
   signal Google learns to ignore, and then keeps ignoring once there is a real
   one.

   NO priority AND NO changeFrequency. Google ignores both.

   NO /lp/* PAGES. Those are for paid traffic and carry a noindex, and a sitemap
   entry for a page that refuses the index is a contradiction Search Console
   reports as an error. See app/(landing)/layout.tsx.
   ─────────────────────────────────────────────────────────────────────────── */

export default function sitemap(): MetadataRoute.Sitemap {
  // Keyed by path, so no URL can appear twice.
  const lastModified = new Map<string, string>();
  for (const { path } of siteRoutes) lastModified.set(path, pageUpdated(path));
  for (const guide of guides) lastModified.set(`/guides/${guide.slug}`, guide.updated);

  return Array.from(lastModified, ([path, date]) => ({
    url: absoluteUrl(path),
    lastModified: date,
  }));
}

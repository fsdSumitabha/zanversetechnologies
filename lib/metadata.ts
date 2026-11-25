import type { Metadata } from "next";
import { pageUpdated } from "@/constants/freshness";
import { siteRoutes } from "@/constants/pages";
import { site } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   PAGE METADATA

   One shape for every page's metadata, so a route only has to say what it is
   about and where it lives.

   WHY EVERY PAGE REBUILDS openGraph AND twitter IN FULL. Next merges metadata
   objects key by key, but it does not deep-merge the values: a page that
   returns its own `openGraph` REPLACES the root layout's outright. So the
   layout's og:url, og:locale and og:image would reach exactly one route, the
   homepage, and twitter:card would quietly degrade to `summary` everywhere
   else. This builder re-emits the whole block so that cannot happen.

   WHY `path` IS REQUIRED. The canonical is per page. The layout sets none,
   because a canonical inherited from the layout would point every page that
   forgot its own at the homepage; making the field required means a page
   cannot forget it.

   WHAT `path` ALSO DECIDES. A public, indexed page gets a Markdown alternate
   and, unless it is the homepage, a share card of its own. Anything else (the
   /lp pages, /thank-you) gets neither. The builder only ever receives a path,
   so the test is on the path, and this file must stay light: it may not import
   constants/services or constants/guides, which hold every page's copy.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * The 1200x630 card every share of this site falls back to. The version
 * query changes whenever the card does: social networks cache a card by its
 * URL, so a card redrawn under the same address would keep showing the old
 * one.
 */
export const OG_IMAGE = "/og-default.png?v=2";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** The absolute URL of one path on this site: "/" is the bare origin. */
export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

/**
 * The homepage's <title>, also the default every other title falls back to.
 * It leads with what the page should rank for, and the short name keeps the
 * whole thing at 58 characters, under the point where Google cuts a title off.
 */
export const HOME_TITLE = `IT Company in Dubai: Web, Apps, AI & Marketing | ${site.shortName}`;

const REGISTERED_PATHS: ReadonlySet<string> = new Set(siteRoutes.map((route) => route.path));

/**
 * Whether a path is a public, indexed page. The registry holds all of them but
 * the guides, which constants/pages.ts may not import, so those go by folder:
 * a guide's page only asks for metadata when the guide exists.
 */
function isPublicPage(path: string): boolean {
  return REGISTERED_PATHS.has(path) || path.startsWith("/guides/");
}

/**
 * Whether a path has a share card of its own, at /og<path>.png. THE ONE PLACE
 * THAT IS DECIDED: `shareImage` asks it before naming a card's URL, and
 * app/og/[...path]/route.tsx asks it before drawing one, so a page cannot
 * advertise a card that gives a 404. The homepage keeps the default card, as
 * do the /lp pages, /thank-you and the 404s, none of which pass this test.
 */
export function hasShareCard(path: string): boolean {
  return path !== "/" && isPublicPage(path);
}

/**
 * The image a share of this path shows, as a path on this site.
 *
 * The date in the query has the same job as OG_IMAGE's version, and matters
 * more here: unlike a file in public/, a card is answered by Next, so
 * next.config.ts's one-year rule for .png reaches it. A new title means the
 * page's date moved (constants/freshness.ts), so the URL moves with it. Redraw
 * the cards themselves and this query has to change by hand.
 */
export function shareImage(path: string): string {
  return hasShareCard(path) ? `/og${path}.png?v=${pageUpdated(path)}` : OG_IMAGE;
}

/** The Markdown copy of a public page (app/md): "/" is /index.md, the rest add .md. */
export function markdownUrl(path: string): string {
  return absoluteUrl(path === "/" ? "/index.md" : `${path}.md`);
}

export interface PageMetadataArgs {
  /** Without the company name; it is appended here. */
  title: string;
  description: string;
  /** This page's own path, e.g. "/services/web-development". */
  path: string;
  /** Use `title` as the whole <title>, without the company name appended. */
  absoluteTitle?: boolean;
}

/**
 * The root layout sets metadataBase, applicationName, verification and the
 * `robots` block, and Next merges those down into every route, so nothing here
 * repeats them. Everything Next would REPLACE rather than merge (the whole of
 * `openGraph`, the whole of `twitter`) is rebuilt here in full, along with the
 * page's canonical and its Markdown alternate.
 */
export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataArgs): Metadata {
  const full = absoluteTitle ? title : `${title} — ${site.name}`;
  const canonical = absoluteUrl(path);
  const image = shareImage(path);

  return {
    title: { absolute: full },
    description,
    alternates: {
      canonical,
      // Only where app/md has a copy to point at. The /lp pages have none.
      ...(isPublicPage(path) ? { types: { "text/markdown": markdownUrl(path) } } : {}),
    },
    openGraph: {
      title: full,
      description,
      type: "website",
      url: canonical,
      siteName: site.name,
      locale: site.ogLocale,
      images: [
        {
          url: image,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          // What the image says: a page's own card adds the page's title.
          alt: hasShareCard(path) ? `${title}, ${site.name}` : site.name,
        },
      ],
    },
    twitter: {
      // Without an image this degrades to a plain `summary` card whatever it
      // says here.
      card: "summary_large_image",
      // The parent company's X account, as in the root layout: Zan Services,
      // which Zan Verse Technologies is part of (constants/zan.ts).
      site: "@zanservices",
      title: full,
      description,
      images: [image],
    },
  };
}

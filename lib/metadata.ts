import type { Metadata } from "next";
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
   ─────────────────────────────────────────────────────────────────────────── */

/** The 1200x630 card every share of this site falls back to. */
export const OG_IMAGE = "/og-default.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** The absolute URL of one path on this site: "/" is the bare origin. */
export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

/** The homepage's <title>, also the default every other title falls back to. */
export const HOME_TITLE = `${site.name} — Development, Digital Marketing & Designing`;

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
 * pre-launch `robots` block, and Next merges those down into every route, so
 * nothing here repeats them. Everything Next would REPLACE rather than merge
 * (the whole of `openGraph`, the whole of `twitter`) is rebuilt here in full,
 * along with the page's canonical.
 */
export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataArgs): Metadata {
  const full = absoluteTitle ? title : `${title} — ${site.name}`;
  const canonical = absoluteUrl(path);

  return {
    title: { absolute: full },
    description,
    alternates: { canonical },
    openGraph: {
      title: full,
      description,
      type: "website",
      url: canonical,
      siteName: site.name,
      locale: site.ogLocale,
      images: [
        {
          url: OG_IMAGE,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: site.name,
        },
      ],
    },
    twitter: {
      // Without an image this degrades to a plain `summary` card whatever it
      // says here.
      card: "summary_large_image",
      site: "@zanservices",
      title: full,
      description,
      images: [OG_IMAGE],
    },
  };
}

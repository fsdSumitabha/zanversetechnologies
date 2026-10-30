import type { MetadataRoute } from "next";
import { site } from "@/constants/zan";
import { brandPalette } from "@/lib/brand";

/**
 * The web app manifest: the name and icons a phone uses when someone adds the
 * site to their home screen. It opens in the browser as before (`display:
 * "browser"`); this is a company site, not an app to install.
 *
 * The favicon set itself is file-based, in this folder: favicon.ico (16, 32,
 * 48), icon.svg (which turns the navy shard white in a dark browser theme),
 * icon.png and apple-icon.png. Next writes their <link> tags.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.tagline,
    start_url: "/",
    display: "browser",
    background_color: brandPalette.bg,
    theme_color: brandPalette.bg,
    icons: [
      { src: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // On white, with the mark inside the circle a launcher may crop it to.
      { src: "/images/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

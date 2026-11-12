import { ImageResponse } from "next/og";
import { guides } from "@/constants/guides";
import { legalDocuments } from "@/constants/legal";
import {
  aboutPage,
  contactPage,
  guidesPage,
  howWeWorkPage,
  legalSlugs,
  ourTeamPage,
  portfolioPage,
  servicePages,
  servicesPage,
  siteRoutes,
} from "@/constants/pages";
import { getServiceContent } from "@/constants/services";
import { site } from "@/constants/zan";
import { brandPalette } from "@/lib/brand";
import { hasShareCard, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/metadata";

/* ───────────────────────────────────────────────────────────────────────────
   ONE SHARE CARD PER PUBLIC PAGE

   /og/services/web-development.png is what a shared link to
   /services/web-development shows: the page's title and the company's name on
   the brand's navy, and nothing else. lib/metadata.ts builds that URL from the
   page's path, and its `hasShareCard` is the one place that decides which paths
   have a card. The list below goes through the same test, so a page cannot name
   a card that is not here.

   All of them are drawn at build time. Any other address is a 404, and nothing
   here reads the request.

   The face is Geist Regular, which ImageResponse brings with it. Satori takes no
   woff2, and the site's fonts only exist as that.
   ─────────────────────────────────────────────────────────────────────────── */

export const dynamic = "force-static";
export const dynamicParams = false;

/**
 * ImageResponse cannot read CSS variables: it draws outside any page, so
 * nothing here can resolve var(--color-action). These are the tokens in
 * app/globals.css as plain hex, by way of lib/brand.ts, which exists to keep that
 * copy in one place:
 *
 *   navy   #172554  --color-navy-900, the logo's navy, and --color-action
 *   white  #ffffff  --color-action-foreground, 14.69:1 on the navy
 *   cyan   #44d9f8  --color-accent
 */
const NAVY = brandPalette.from;
const WHITE = brandPalette.surface;
const CYAN = brandPalette.accent;

/** What the card says for each page: the title its <title> opens with. */
const TITLES: ReadonlyMap<string, string> = new Map([
  ["/services", servicesPage.seoTitle],
  ["/portfolio", portfolioPage.seoTitle],
  ["/how-we-work", howWeWorkPage.seoTitle],
  ["/about-us", aboutPage.seoTitle],
  ["/our-team", ourTeamPage.seoTitle],
  ["/contact-us", contactPage.seoTitle],
  ["/guides", guidesPage.seoTitle],
  ...servicePages.map((page): [string, string] => [
    page.href,
    getServiceContent(page.priceKey)?.seoTitle ?? page.seoTitle,
  ]),
  ...legalSlugs.map((slug): [string, string] => [`/${slug}`, legalDocuments[slug].title]),
  ...guides.map((guide): [string, string] => [`/guides/${guide.slug}`, guide.seoTitle]),
]);

/**
 * A page added to the registry before anyone adds a line above still gets a
 * card, with its name read from the address: "/guides" says "Guides". A missing
 * title must not turn into a card that gives a 404.
 */
function titleOf(path: string): string {
  const named = TITLES.get(path);
  if (named) return named;
  const words = path.slice(path.lastIndexOf("/") + 1).split("-");
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/** Every card, by its address under /og/: "services/web-development.png". */
const CARDS: ReadonlyMap<string, string> = new Map(
  [...siteRoutes.map((route) => route.path), ...guides.map((guide) => `/guides/${guide.slug}`)]
    .filter(hasShareCard)
    .map((path) => [`${path.slice(1)}.png`, titleOf(path)]),
);

export function generateStaticParams() {
  return Array.from(CARDS.keys(), (card) => ({ path: card.split("/") }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const title = CARDS.get(path.join("/"));
  if (!title) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: NAVY,
      }}
    >
      <div style={{ fontSize: 88, lineHeight: 1.08, color: WHITE }}>{title}</div>
      <div style={{ fontSize: 36, color: CYAN }}>{site.name}</div>
    </div>,
    { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
  );
}

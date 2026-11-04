import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "@/components/zan/landing/landing.css";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { Analytics } from "@/components/zan/analytics/Analytics";
import { ConsentBanner } from "@/components/zan/analytics/ConsentBanner";
import { Providers } from "@/components/zan/Providers";
import { ScrollProgress } from "@/components/zan/shell/ScrollProgress";
import { site } from "@/constants/zan";
import { brandPalette } from "@/lib/brand";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
/* Only the h1's face is preloaded. On a slow connection the other two would
   compete with the scripts for what they use only for labels and for headings
   further down the page. */
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
  preload: false,
});

/* NOINDEX, FOLLOW, AND NOT JUST UNTIL CUTOVER. These pages carry the same
   questions and services as /services/*, which are the URLs meant to rank; a
   second copy built for ad clicks would only split them. They are reached from
   ads, so they stay out of the sitemap as well. If that ever changes, this block
   and the note in app/sitemap.ts are the two places to look. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export const viewport: Viewport = {
  themeColor: brandPalette.canvas,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * The landing pages' root layout, the site's third.
 *
 * Paid traffic is paying for the first second. So these pages share the site's
 * tokens, type and motion, but not its shell: no preloader in front of the hero,
 * no mega menu to wander off through, no timed modal over a form the visitor is
 * filling in, and no contact dock competing with the sticky button.
 *
 * `data-preloaded` is set from the start: there is no preloader here to announce
 * its end, and the hero's entrance and the cookie banner both wait on that flag.
 *
 * The consent banner and the tags are the same ones as everywhere else, because
 * measuring these pages is the reason they exist, and the consent they wait for
 * is the same promise. Leaving for /thank-you crosses into the site's root
 * layout, which is a full page load; LandingForm prepares for that.
 */
export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={site.lang}
      data-preloaded="1"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Without JavaScript nothing would ever reveal: show everything at rest. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="bg-canvas text-foreground antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-full focus:bg-action focus:px-5 focus:py-3 focus:text-small focus:text-action-foreground"
        >
          Skip to content
        </a>
        <div className="noise-overlay" aria-hidden="true" />
        <Providers>
          <ConsentBanner />
          <ScrollProgress />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

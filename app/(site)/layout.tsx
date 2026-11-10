import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { Analytics } from "@/components/zan/analytics/Analytics";
import { ConsentBanner } from "@/components/zan/analytics/ConsentBanner";
import { ContactModal } from "@/components/zan/contact/ContactModal";
import { Providers } from "@/components/zan/Providers";
import { ScrollRefresh } from "@/components/zan/ScrollRefresh";
import { MotionPauseControl } from "@/components/zan/shell/MotionPauseControl";
import { EARLY_INPUT_SCRIPT } from "@/lib/earlyInput";
import { MOTION_PAUSE_SCRIPT } from "@/lib/motionPause";
import { Preloader } from "@/components/zan/shell/Preloader";
import { Navbar } from "@/components/zan/shell/Navbar";
import { Footer } from "@/components/zan/shell/Footer";
import { ScrollProgress } from "@/components/zan/shell/ScrollProgress";
import { RouteChange } from "@/components/zan/shell/RouteChange";
import { WebMcpTools } from "@/components/zan/webmcp/WebMcpTools";
import { homeSeo } from "@/constants/pages";
import { site } from "@/constants/zan";
import { brandPalette } from "@/lib/brand";
import { HOME_TITLE, OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/metadata";
import { jsonLd, organizationSchema, websiteSchema } from "@/lib/schema";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

/**
 * The display face, for the hero and every heading on the site. A variable
 * grotesque with optical-size and width axes, so a headline can be set large,
 * tight and heavy without looking like the default system sans every template
 * ships with. It replaced a serif that was doing the headings: one display
 * face, used everywhere, reads as a decision rather than a mix.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

/**
 * What every route inherits. Static: nothing here depends on the request, so
 * every page under this layout prerenders unless it reads the request itself
 * (only /contact-us does, for its ?from=).
 *
 * NO CANONICAL, and no og:url. Both are per page, and every page sets its own
 * through pageMetadata (lib/metadata.ts). One inherited from here would point
 * any page that forgot its own at the homepage.
 *
 * The title, description and share card below are the homepage's, as the
 * fallback for anything that sets none; every route replaces them with its
 * own. Next does not deep-merge `openGraph` or `twitter`, which is why
 * pageMetadata re-emits both in full rather than relying on these.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // A plain string here is the default for any route that sets no title of
  // its own. No template: pageMetadata writes each page's whole title.
  title: HOME_TITLE,
  // Shorter than `site.description`, which is body copy and runs past the
  // point Google truncates.
  description: homeSeo.description,
  applicationName: site.name,
  verification: {
    // The Google Search Console property token the previous builds were
    // verified with, so ownership carries over rather than needing
    // re-verifying when this build goes live.
    google: "TJOK4WNf7fvLnfx5Iq4r-OWbpcUjk9o-gme3yAt84g0",
  },
  openGraph: {
    title: HOME_TITLE,
    description: homeSeo.description,
    type: "website",
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
    card: "summary_large_image",
    site: "@zanservices",
    title: HOME_TITLE,
    description: homeSeo.description,
    images: [OG_IMAGE],
  },
  robots: {
    googleBot: {
      // Full-size image thumbnails and untruncated snippets in results.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  // The page ground, so the browser chrome runs straight into it.
  themeColor: brandPalette.canvas,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* The browser's WebMCP origin trial token for this domain, once there is one.
   Until then the tools only work for someone who has turned on the flag, and
   no tag is written. A token is public by design. */
const webMcpTrialToken = process.env.NEXT_PUBLIC_WEBMCP_OT_TOKEN;

/**
 * The marketing site's root layout — one of three. The agent console has its own
 * in app/(console)/agent/layout.tsx, so nothing here (the shell, the consent
 * banner, the tags) ever loads on a page that shows leads and transcripts. The
 * paid landing pages have theirs in app/(landing)/layout.tsx, without the shell.
 * app/global-not-found.tsx renders unmatched URLs inside this layout too.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={site.lang}
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
      // The preloader's inline script (components/zan/shell/Preloader.tsx)
      // can mark this element data-preloaded before React hydrates, when the
      // preloader is to be skipped, so React must not police the attributes
      // it finds here.
      suppressHydrationWarning
    >
      <head>
        {webMcpTrialToken ? <meta httpEquiv="origin-trial" content={webMcpTrialToken} /> : null}
        {/* A "Pause animations" choice saved on an earlier visit, before the page paints. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_PAUSE_SCRIPT }} />
        {/* Notes input before hydration, for the section-link hold. */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_INPUT_SCRIPT }} />
        {/* WHO THIS IS, on every page. The Organization node is the company —
            the Dubai office's address and number, the services, the people —
            and the WebSite node is this site; both carry a stable @id that
            the per-page WebPage, Article and Service nodes point back to.
            Attached in the layout rather than on the homepage alone so that a
            crawler landing on any URL in the sitemap gets the company with
            it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(), websiteSchema()) }}
        />
        {/* Without JavaScript nothing would ever reveal: show everything at rest.
            That goes for the closed FAQ answers too, which only a click could
            open, and the team rail's controls are hidden, because the rail is
            still a native scroller and nothing could drive the buttons. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}#zan-preloader{display:none!important}.zan-faq-panel{grid-template-rows:1fr!important}.zan-faq-panel p,.zan-faq-panel [hidden]{opacity:1!important;transform:none!important;translate:none!important;content-visibility:visible!important}.zan-team-controls{display:none}`}</style>
        </noscript>
      </head>
      <body className="bg-canvas text-foreground antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-full focus:bg-action focus:px-5 focus:py-3 focus:text-small focus:text-action-foreground"
        >
          Skip to content{" "}
        </a>
        <MotionPauseControl />
        <div className="noise-overlay" aria-hidden="true" />
        <Providers>
          {/* Straight after the skip link and the pause control, so a keyboard
              or a screen reader reaches it before the page; on screen it sits
              at the bottom. */}
          <ConsentBanner />
          <Preloader />
          <ScrollProgress />
          <ScrollRefresh />
          <SmoothScrollProvider>
            <RouteChange />
            <Navbar />
            {children}
            <Footer />
          </SmoothScrollProvider>
          {/* Mounted once for the whole site, so the delay and the "asked
              already" flag belong to the visit rather than to a page. It
              renders nothing until it opens, and never opens where the
              enquiry form already is. */}
          <ContactModal />
        </Providers>
        {/* Last in the body, and deferred from there: the three tags load only
            for a visitor who has agreed to them in the cookie banner, and then
            on idle or first interaction, never during the first paint. */}
        <Analytics />
        {/* Renders nothing, and loads nothing unless the browser has WebMCP. */}
        <WebMcpTools />
      </body>
    </html>
  );
}

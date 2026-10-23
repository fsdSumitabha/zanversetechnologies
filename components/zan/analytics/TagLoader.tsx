"use client";

import { useEffect } from "react";
import { site } from "@/constants/zan";
import type { Consent } from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";

/* The company's own containers, the ones its earlier site already reported
   to, so the history in each account carries over. */
const GTM_ID = "GTM-WKT2N6FF";
const META_PIXEL_ID = "1425758958953911";
const LINKEDIN_PARTNER_ID = "9756265";

/* Because those are the LIVE accounts, they load on the production host and
   nowhere else. A tester who accepts on localhost, the staging build or a
   deploy preview would otherwise send real events, and an enquiry sent from
   there counts as a Google Ads conversion that Smart Bidding then learns
   from. The host is read from site.url, and www is allowed beside it,
   because whichever of the two the host serves is production. GTM's Preview
   mode therefore only works on the production domain. */
const PRODUCTION_HOST = new URL(site.url).hostname;
const isProductionHost = (hostname: string) =>
  hostname === PRODUCTION_HOST || hostname === `www.${PRODUCTION_HOST}`;

declare global {
  interface Window {
    _linkedin_data_partner_ids?: string[];
    /** The bootstrap's queue until fbevents.js arrives and replaces it. */
    fbq?: (...args: unknown[]) => void;
  }
}

function addScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Module scope: a remount, or StrictMode's second effect, must not load a tag twice. */
const loaded = { gtm: false, marketing: false };

function loadTags(consent: Consent) {
  // GTM carries Google Analytics and the Google Ads tags, so either category
  // needs it. Consent Mode is already in the dataLayer ahead of gtm.js, so
  // every Google tag knows what it may do before it first fires.
  if ((consent.analytics || consent.marketing) && !loaded.gtm) {
    loaded.gtm = true;
    (window.dataLayer ??= []).push({ "gtm.start": Date.now(), event: "gtm.js" });
    addScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }

  // Meta and LinkedIn do not read Consent Mode. They load with marketing
  // consent and not otherwise.
  if (consent.marketing && !loaded.marketing) {
    loaded.marketing = true;
    (window._linkedin_data_partner_ids ??= []).push(LINKEDIN_PARTNER_ID);
    addScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
    // Queued on the bootstrap's stub and run in order when fbevents.js lands,
    // so the pixel is initialised before any event GTM sends it.
    window.fbq?.("init", META_PIXEL_ID);
    window.fbq?.("track", "PageView");
    addScript("https://connect.facebook.net/en_US/fbevents.js");
  }
}

/**
 * Loads what the visitor has agreed to, and nothing before they have.
 *
 * Deferred as it always was: to browser idle or the visitor's first touch,
 * whichever comes first, with a timeout so a busy main thread cannot starve
 * it. For a choice made on this page the touch has already happened, so it is
 * the idle callback, which on a settled page is all but immediate.
 */
export function TagLoader() {
  const consent = useConsent();

  useEffect(() => {
    if (!consent || !(consent.analytics || consent.marketing)) return;
    if (!isProductionHost(window.location.hostname)) return;
    // Lighthouse, a prerender and the screenshot runs are not visits, and
    // GTM's own container would otherwise record them.
    if (/HeadlessChrome|Puppeteer/i.test(navigator.userAgent)) return;

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      loadTags(consent);
    };

    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(run, { timeout: 3000 }) : window.setTimeout(run, 2000);
    const touches = ["scroll", "click", "keydown", "touchstart"] as const;
    for (const type of touches) window.addEventListener(type, run, { once: true, passive: true });

    return () => {
      done = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      for (const type of touches) window.removeEventListener(type, run);
    };
  }, [consent]);

  return null;
}

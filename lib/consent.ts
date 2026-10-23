/* ───────────────────────────────────────────────────────────────────────────
   COOKIE CONSENT

   The Cookie Policy (constants/legal.ts, "How We Obtain Consent") promises
   opt-in consent for everything that is not strictly necessary, given by
   category and withdrawable at any time. This module is the record of that
   choice and the one place it changes. Two categories, named as the policy
   names them:

     analytics   Google Analytics, through Google Tag Manager
     marketing   Google Ads (also through GTM), the Meta Pixel and the
                 LinkedIn Insight Tag

   Nothing is granted until the visitor chooses, and nothing loads until
   something is granted. Three things read the choice:

     · the inline bootstrap in components/zan/analytics/Analytics.tsx, which
       sets Google Consent Mode v2 to "denied" before anything else can touch
       the dataLayer, then applies a choice made on an earlier visit;
     · TagLoader, which loads only the tags the choice allows;
     · ConsentBanner, which asks, and reopens from the footer's Cookie settings.

   The choice is kept in localStorage with a version. Bump CONSENT_VERSION and
   every visitor is asked again, which is what a new tag or category needs.

   Free of React, like lib/links.ts, so the server component that renders the
   bootstrap can import the constants. The hook is in lib/useConsent.ts.
   ─────────────────────────────────────────────────────────────────────────── */

export type ConsentCategory = "analytics" | "marketing";

/** What the visitor allowed. Strictly necessary storage is not a choice. */
export type Consent = Record<ConsentCategory, boolean>;

export const CONSENT_KEY = "zan.consent";

/** Bump to ask every visitor again: a new tag, a new category, a new purpose. */
export const CONSENT_VERSION = 1;

/** Fired on window to open the banner's settings panel. */
const SETTINGS_EVENT = "zan:consent-settings";

/**
 * The Consent Mode v2 signals each category grants. All of them start out
 * "denied". The inline bootstrap reads this same table, so the page and the
 * bootstrap cannot disagree about what "marketing" means to Google.
 */
export const CONSENT_SIGNALS: Record<ConsentCategory, readonly string[]> = {
  analytics: ["analytics_storage"],
  marketing: ["ad_storage", "ad_user_data", "ad_personalization"],
};

const CATEGORIES = Object.keys(CONSENT_SIGNALS) as ConsentCategory[];

/**
 * Name prefixes of the first-party cookies each category's tags write, deleted
 * when that category is withdrawn. Google Analytics: _ga, _ga_<id>, _gid,
 * _gat. Google Ads: _gcl_*. Meta: _fbp, _fbc. LinkedIn: li_fat_id, li_giant,
 * ln_or. LinkedIn's own cookies sit on linkedin.com, out of this site's reach.
 */
const TRACKING_COOKIES: Record<ConsentCategory, readonly string[]> = {
  analytics: ["_ga", "_gid", "_gat"],
  marketing: ["_gcl_", "_fbp", "_fbc", "li_fat_id", "li_giant", "ln_or"],
};

declare global {
  interface Window {
    /** Defined by the bootstrap: pushes its arguments onto the dataLayer. */
    gtag?: (...args: unknown[]) => void;
  }
}

interface StoredConsent extends Consent {
  v: number;
  /** When the choice was made, in epoch milliseconds. */
  at: number;
}

function readStored(): Consent | null {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null") as Partial<StoredConsent> | null;
    if (saved?.v !== CONSENT_VERSION) return null;
    if (typeof saved.analytics !== "boolean" || typeof saved.marketing !== "boolean") return null;
    return { analytics: saved.analytics, marketing: saved.marketing };
  } catch {
    // Blocked storage or a value that is not ours: ask again.
    return null;
  }
}

/* The snapshot useSyncExternalStore reads: the same object until the choice
   changes. `undefined` until storage has been read once. */
let current: Consent | null | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** The visitor's choice, or null if they have not made one. Browser only. */
export function getConsent(): Consent | null {
  if (current === undefined) current = readStored();
  return current;
}

/** Consent Mode's reading of a choice. */
function signals(choice: Consent): Record<string, "granted" | "denied"> {
  const state: Record<string, "granted" | "denied"> = {};
  for (const category of CATEGORIES) {
    for (const signal of CONSENT_SIGNALS[category]) state[signal] = choice[category] ? "granted" : "denied";
  }
  return state;
}

/** A choice made in another tab applies in this one too. */
function onStorage(event: StorageEvent) {
  if (event.key !== CONSENT_KEY && event.key !== null) return;
  current = readStored();
  if (current) window.gtag?.("consent", "update", signals(current));
  notify();
}

export function subscribeConsent(onChange: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * Expires every readable cookie whose name starts with one of `prefixes`. A
 * tag may have set it on this host or on any parent domain (Google's
 * cookie_domain "auto" picks the widest one the browser allows), so each is
 * expired on all of them. The ones that never matched change nothing.
 */
function deleteCookies(prefixes: readonly string[]) {
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) domains.push(`;domain=.${labels.slice(i).join(".")}`);
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0].trim();
    if (!name || !prefixes.some((prefix) => name.startsWith(prefix))) continue;
    for (const domain of domains) document.cookie = `${name}=;path=/;max-age=0${domain}`;
  }
}

/**
 * Records a choice and applies it at once: Consent Mode is updated, and
 * TagLoader loads whatever is newly allowed.
 *
 * Withdrawing is the other half, and the policy promises it "anytime". A tag
 * that has loaded cannot be unloaded, so a category that goes from allowed to
 * refused has its cookies deleted and the page is reloaded, to run as every
 * later page will: without it.
 */
export function saveConsent(choice: Consent) {
  const before = getConsent();
  current = { analytics: choice.analytics, marketing: choice.marketing };
  try {
    const stored: StoredConsent = { ...current, v: CONSENT_VERSION, at: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {
    // Private mode: the choice holds for this visit and is asked for again on
    // the next one.
  }
  window.gtag?.("consent", "update", signals(current));

  const withdrawn = CATEGORIES.filter((category) => before?.[category] && !choice[category]);
  if (withdrawn.length > 0) {
    deleteCookies(withdrawn.flatMap((category) => TRACKING_COOKIES[category]));
    window.location.reload();
    return;
  }
  notify();
}

/** Opens the banner's settings panel. The footer's Cookie settings calls it. */
export function openConsentSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

/** For the banner: runs `open` whenever something asks for the settings panel. */
export function onConsentSettings(open: () => void) {
  window.addEventListener(SETTINGS_EVENT, open);
  return () => window.removeEventListener(SETTINGS_EVENT, open);
}

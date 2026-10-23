/* ───────────────────────────────────────────────────────────────────────────
   ANALYTICS

   One dataLayer, three tags. Google Tag Manager, the Meta Pixel and the
   LinkedIn Insight tag are all loaded by components/zan/analytics/Analytics.tsx,
   and only for a visitor who has agreed to them in the cookie banner
   (lib/consent.ts). Even then they are deferred to browser idle or the
   visitor's first interaction, whichever comes first — the same arrangement
   the company's earlier site used, so nothing here costs LCP.

   Everything below pushes to `window.dataLayer` and nothing else. GTM is the
   only tag that reads it; Meta and LinkedIn are fired from inside GTM, which
   is where the container's triggers already live. Naming the events any other
   way would mean rebuilding those triggers, so the event names and their
   payload shapes are the earlier site's exactly, bar one deliberate change:
   form_submission no longer carries what the visitor typed.

     form_submission   an enquiry reached EmailJS: the form name and the
                       service, nothing personal
     generate_lead     the /thank-you page was reached — the Google Ads
                       conversion, with the user_data block Enhanced
                       Conversions hashes and matches on
     whatsapp_click    a WhatsApp link was followed
     contact_click     a tel: or mailto: link was followed
     popup_view        an overlay was shown

   Every push guards `window.dataLayer` itself rather than assuming the
   bootstrap has run. An event can happen before the tags have loaded — a
   visitor who submits the form in the first second — and an array that is
   waiting is exactly what GTM drains when it arrives. For a visitor who never
   agrees, GTM never arrives: the array stays in the tab and goes nowhere.
   ─────────────────────────────────────────────────────────────────────────── */

/** A dataLayer row. Values are plain JSON; GTM does not accept anything else. */
type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

/** Server-rendered code calls these too, so nothing happens without a window. */
function push(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  (window.dataLayer ??= []).push(event);
}

/**
 * An enquiry that EmailJS accepted. Not fired on a failed send.
 *
 * The form's name and the service picked from its list, and nothing the
 * visitor typed. Every tag in the container can read the dataLayer, so a name,
 * an address, a number or a message pushed here would be one tag away from
 * Google, Meta or LinkedIn, and Google Analytics' terms forbid receiving them
 * at all. The earlier site pushed the whole form as `form_data`; that key is
 * gone on purpose.
 */
export function trackFormSubmission(formName: string, service: string) {
  push({ event: "form_submission", form_name: formName, service });
}

/**
 * The conversion itself, fired once on /thank-you.
 *
 * `user_data` is what Google Ads Enhanced Conversions matches on: the address
 * and number the visitor gave, hashed by the tag before they leave the
 * browser. Without it the conversion still counts, but it cannot be tied back
 * to the click that produced it, which is the whole point of the page.
 */
export function trackGenerateLead(user: { email?: string; phone?: string }) {
  push({
    event: "generate_lead",
    conversion_type: "lead_form_submit",
    page: "/thank-you",
    user_data: {
      email: user.email ?? "",
      phone_number: user.phone ?? "",
    },
  });
}

/** A WhatsApp link. `label` says which one, as the container's reports expect. */
export function trackWhatsAppClick(label: string) {
  push({ event: "whatsapp_click", click_label: label });
}

/** A tel: or mailto: link. */
export function trackContactClick(label: string) {
  push({ event: "contact_click", click_label: label });
}

/** An overlay the visitor was shown. */
export function trackPopupView(popupName: string) {
  push({ event: "popup_view", popup_name: popupName });
}

/* ── The lead the /thank-you page reports ─────────────────────────────────── */

/**
 * Where the enquiry form leaves the details /thank-you needs for `user_data`.
 *
 * The earlier site carried them in react-router's navigation state. The App
 * Router has no equivalent, and a query string is the wrong answer: it would
 * put an address and a phone number into the URL, the referrer, the server
 * logs and every analytics hit on the page. sessionStorage keeps them in the
 * one tab, for the one navigation, and the page clears them on read.
 */
const LEAD_KEY = "zan.lead";

export function rememberLead(user: { email: string; phone: string }) {
  try {
    sessionStorage.setItem(LEAD_KEY, JSON.stringify(user));
  } catch {
    // Private mode or blocked storage. The conversion still fires, just
    // without the details that would let Ads match it to a click.
  }
}

/** Reads and clears, so a reload of /thank-you cannot report the lead twice. */
export function takeLead(): { email: string; phone: string } | null {
  try {
    const raw = sessionStorage.getItem(LEAD_KEY);
    sessionStorage.removeItem(LEAD_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { email, phone } = parsed as Record<string, unknown>;
    return {
      email: typeof email === "string" ? email : "",
      phone: typeof phone === "string" ? phone : "",
    };
  } catch {
    return null;
  }
}

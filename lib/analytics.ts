/* ───────────────────────────────────────────────────────────────────────────
   ANALYTICS

   One dataLayer, four tags. Google Tag Manager, the Google Ads tag, the Meta
   Pixel and the LinkedIn Insight tag are all loaded by
   components/zan/analytics/Analytics.tsx,
   and only for a visitor who has agreed to them in the cookie banner
   (lib/consent.ts). Even then they are deferred to browser idle or the
   visitor's first interaction, whichever comes first — the same arrangement
   the company's earlier site used, so nothing here costs LCP.

   Everything below pushes to `window.dataLayer` and nothing else. Triggers in
   the GTM container are what act on these events, so they have to listen for
   the names spelled exactly as they are here. The event names and their payload
   shapes are the earlier site's, bar two deliberate changes: form_submission no
   longer carries what the visitor typed, and generate_lead has a second shape,
   for an enquiry an AI agent sent, which the earlier site could not receive.

     form_submission   an enquiry was sent: the form name and the service,
                       nothing personal. The form name is "webmcp" when the
                       WebMCP tool send_enquiry sent it
     generate_lead     the Google Ads conversion, with the user_data block
                       Enhanced Conversions hashes and matches on. Fired when a
                       lead the forms' script sent reaches /thank-you, and by
                       nothing else that reaches that page. Also fired by
                       send_enquiry once the route says the enquiry went, with
                       conversion_type "webmcp_enquiry" and lead_source
                       "webmcp" to tell it apart
     whatsapp_click    a WhatsApp link was followed
     contact_click     a tel: or mailto: link was followed
     phone Icon click  a tel: link was followed, under the name the container's
                       call conversion listens for
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
 * An enquiry that was sent. Not fired on a failed send.
 *
 * The form's name and the service picked from its list, and nothing the
 * visitor typed. Every tag in the container can read the dataLayer, so a name,
 * an address, a number or a message pushed here would be one tag away from
 * Google, Meta or LinkedIn, and Google Analytics' terms forbid receiving them
 * at all. The earlier site pushed the whole form as `form_data`; that key is
 * gone on purpose.
 *
 * A landing page adds which page and which of its forms, under the keys the
 * earlier site's landing pages used: campaigns are bought per page, so that is
 * the unit the reports need.
 *
 * The WebMCP tool send_enquiry sends it too, as the form "webmcp". The agent
 * writes its service itself, so the tool pushes only a title the site knows: one
 * from list_services, "Not sure yet", or "Other" for anything else
 * (knownService in components/zan/webmcp/tools.ts).
 */
export function trackFormSubmission(
  formName: string,
  service: string,
  landing?: { landing_page: string; form_location: string },
) {
  push({ event: "form_submission", form_name: formName, service, ...landing });
}

/**
 * The conversion itself. It fires at most once for a lead, from one of two places.
 *
 * /thank-you, for a lead takeLead() handed back: one a form's script sent. That
 * is `trackGenerateLead(lead)`, and its shape is the earlier site's.
 *
 * The WebMCP tool send_enquiry, with `{ source: "webmcp" }`, once the route has
 * said the enquiry went. The owner decided on 10 November 2026 that an agent's
 * enquiry counts as a lead. The tool goes to no page, so `page` is where the
 * agent was. conversion_type "webmcp_enquiry" and lead_source "webmcp" are what
 * a GTM trigger or a report tells it apart by. A form an agent filled and a
 * person sent is a form's lead, and reaches /thank-you like any other.
 *
 * `user_data` is what Google Ads Enhanced Conversions matches on: the address
 * and number given, hashed by the tag before they leave the browser. That is
 * what ties the conversion back to the click that produced it, which is the
 * whole point of /thank-you.
 */
export function trackGenerateLead(
  user: { email?: string; phone?: string },
  from?: { source: "webmcp" },
) {
  // As in push(), and before the address is read.
  if (typeof window === "undefined") return;
  push({
    event: "generate_lead",
    ...(from?.source === "webmcp"
      ? { conversion_type: "webmcp_enquiry", lead_source: "webmcp", page: window.location.pathname }
      : { conversion_type: "lead_form_submit", page: "/thank-you" }),
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

/**
 * A tel: link, as a Google Ads conversion.
 *
 * Spaces and capitals included, this is the exact event the company's call
 * conversion was built on, in GTM-WKT2N6FF, which does not load on this site. A
 * trigger in this site's container has to use the same spelling. The earlier site
 * never sent it (it sent contact_click), so that conversion never fired there.
 * Sent beside contact_click rather than instead of it: the reports keep their row.
 */
export function trackPhoneClick() {
  push({ event: "phone Icon click" });
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
 *
 * It is also what makes a visit to /thank-you a conversion. A lead stored here
 * is the only thing that fires `generate_lead` there, so a cold visit, a
 * reload, a bot in the trap and a plain post with no script all reach it and
 * report nothing. The WebMCP tool stores nothing here and never goes there: it
 * fires its own generate_lead when its send goes (trackGenerateLead).
 */
const LEAD_KEY = "zan.lead";

/**
 * Storage refused: the same details, held for a navigation inside this document,
 * which is how the site's form reaches /thank-you. A landing page's form reaches
 * it by a full page load, which this does not survive, so with storage blocked
 * there that lead is sent and not counted.
 */
let heldLead: { email: string; phone: string } | null = null;

export function rememberLead(user: { email: string; phone: string }) {
  try {
    sessionStorage.setItem(LEAD_KEY, JSON.stringify(user));
  } catch {
    heldLead = user;
  }
}

/**
 * The lead this tab has just sent, or null if there is none. Reads and clears,
 * so a reload of /thank-you cannot report the lead twice.
 */
export function takeLead(): { email: string; phone: string } | null {
  const held = heldLead;
  heldLead = null;
  if (held) return held;
  try {
    const raw = sessionStorage.getItem(LEAD_KEY);
    sessionStorage.removeItem(LEAD_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { email, phone } = parsed as Record<string, unknown>;
    // Both forms require an address, so anything without one is not their lead.
    if (typeof email !== "string" || !email) return null;
    return { email, phone: typeof phone === "string" ? phone : "" };
  } catch {
    return null;
  }
}

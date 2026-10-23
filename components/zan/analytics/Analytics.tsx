import { CONSENT_KEY, CONSENT_SIGNALS, CONSENT_VERSION } from "@/lib/consent";
import { ContactClicks } from "./ContactClicks";
import { TagLoader } from "./TagLoader";

/* ───────────────────────────────────────────────────────────────────────────
   THE THREE TAGS, AND THE CONSENT THEY WAIT FOR

   Google Tag Manager (which carries Google Analytics and Google Ads), the Meta
   Pixel and the LinkedIn Insight tag, on the company's existing containers,
   so the history in each account carries over rather than starting again.

   NONE OF THEM LOADS UNTIL THE VISITOR AGREES. The Cookie Policy
   (constants/legal.ts, "How We Obtain Consent") promises opt-in consent, by
   category, before any non-essential tag runs. ConsentBanner is where it is
   given and lib/consent.ts is where it is kept. The rest is in two parts:

     1. the bootstrap, inline, before anything else. The dataLayer and gtag;
        Google Consent Mode v2 set to "denied" for everything; then a choice
        from an earlier visit applied on top. So the consent state is in the
        dataLayer ahead of every event and of GTM itself, which is the order
        Google requires. Then the Meta and LinkedIn queues: stubs that record
        calls into an array. No network. An event pushed before the tags load
        is not lost, it is waiting, and if the visitor never agrees nothing
        ever reads it.
     2. TagLoader, after hydration, which loads only what was agreed to: GTM
        for either category, Meta and LinkedIn for marketing alone, and only
        on the production domain (site.url), so test visits never reach the
        live accounts. It still waits for browser idle or the first touch, so
        a returning visitor who agreed pays nothing at first paint.

   Gone on purpose: the <noscript> pixels, because without JavaScript there is
   no banner and so no way to agree, and the dns-prefetch hints, which resolved
   the three hosts for every visitor, including the ones who say no.

   The container has a part the page cannot play. Consent Mode governs Google's
   own tags, but only GTM can stop a GA4 tag sending a cookieless ping for a
   visitor who accepted marketing alone, or a custom HTML tag calling fbq or
   lintrk for one who accepted analytics alone. Those tags need an additional
   consent check in the container: analytics_storage for GA4, ad_storage for
   Google Ads, Meta and LinkedIn.
   ─────────────────────────────────────────────────────────────────────────── */

/* functionality_storage and personalization_storage have no category here, so
   they stay denied: Google treats a signal that was never set as granted. */
const bootstrap = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
(function(){
  var gtag = window.gtag;
  var signals = ${JSON.stringify(CONSENT_SIGNALS)};
  function state(choice) {
    var out = {};
    for (var key in signals) signals[key].forEach(function(signal){
      out[signal] = choice && choice[key] === true ? 'granted' : 'denied';
    });
    return out;
  }
  var defaults = state(null);
  defaults.functionality_storage = 'denied';
  defaults.personalization_storage = 'denied';
  gtag('consent', 'default', defaults);
  gtag('set', 'ads_data_redaction', true);
  try {
    var saved = JSON.parse(localStorage.getItem('${CONSENT_KEY}'));
    if (saved && saved.v === ${CONSENT_VERSION}) gtag('consent', 'update', state(saved));
  } catch (e) {}
})();
window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q = [];
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document,'script');
`;

export function Analytics() {
  return (
    <>
      {/* The bootstrap, inline and synchronous, ahead of everything that can
          push an event. A plain script rather than next/script:
          `beforeInteractive` is what this wants, but it is only honoured in
          the root layout's own tree and the linter still reads the rule as
          pages-router only. Inline, at the end of the body, it runs as the
          document is parsed either way, which is long before hydration can
          run an effect. */}
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <TagLoader />
      <ContactClicks />
    </>
  );
}

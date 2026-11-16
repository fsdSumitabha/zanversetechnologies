/* ───────────────────────────────────────────────────────────────────────────
   AGENT MODE

   An AI agent, or any browser driven by a script, gets every page the way a
   visitor who prefers reduced motion gets it: no intro cover, no timed
   enquiry popup, no pinned scroll scenes, no smooth scrolling, and the text of
   each section shown at once instead of revealed by a scroll. The homepage is
   then a plain page, about a third shorter, and scrolling it always shows new
   content. People never get this mode, so what they see does not change.

   The mark is one attribute, <html data-agent="…">, set before the page
   paints. Its value says why:

     signed       the request carried a Signature-Agent header (Web Bot Auth),
                  as ChatGPT agent sends: netlify/edge-functions/agent-mark.ts
                  writes the attribute into the HTML. A person's browser never
                  sends that header.
     webdriver    navigator.webdriver is true: Playwright, Puppeteer, Selenium
                  and the agents built on them, unless they hide it.
     headless     a headless Chrome that says so in its user agent.
     automation   a global or document key that only an automation tool leaves
                  behind (chromedriver, Playwright bindings, PhantomJS…).

   Lighthouse and PageSpeed Insights are left out on purpose: they measure the
   page a person gets, so they must keep getting it. They still skip the cover
   and the popup when navigator.webdriver is true, as before (isAutomated in
   components/zan/shell/shellStore.ts).

   What reads the mark:
     MQ in lib/gsap.ts             every GSAP scene, smooth scroll and media
                                   query store takes its reduced-motion path
     postcss/agent-still.cjs       every reduced-motion rule in the CSS applies,
                                   and every motion-only rule does not
     app/globals.css               reveals show at rest, as without JavaScript
     isAutomated (shellStore)      the preloader and the timed popup skip
     Providers                     framer-motion runs in reduced mode
   ─────────────────────────────────────────────────────────────────────────── */

export const AGENT_ATTRIBUTE = "data-agent";

/**
 * Inline, first in each layout's <head>, so it runs before any stylesheet
 * applies and before any script reads MQ. Leaves an attribute the edge
 * function already wrote. Everything is in a try: a browser that throws on any
 * of it is treated as a person's.
 */
export const AGENT_SCRIPT = `(function(){try{var r=document.documentElement,n=navigator,u=n.userAgent||"",w=window,d=document,why="",i,k;if(r.hasAttribute("${AGENT_ATTRIBUTE}")||/Chrome-Lighthouse/.test(u))return;if(n.webdriver===true)why="webdriver";else if(/HeadlessChrome/.test(u))why="headless";else{k=["__playwright__binding__","__pwInitScripts","callPhantom","_phantom","__nightmare","domAutomation","domAutomationController","__webdriver_evaluate","__selenium_evaluate","__webdriver_script_fn","__driver_evaluate","__fxdriver_evaluate","__selenium_unwrapped","__webdriver_unwrapped","__driver_unwrapped","__fxdriver_unwrapped"];for(i=0;i<k.length;i++)if(k[i] in w){why="automation";break}if(!why){k=Object.keys(d).concat(Object.keys(w));for(i=0;i<k.length;i++)if(/^\\$?cdc_/.test(k[i])){why="automation";break}}}if(why)r.setAttribute("${AGENT_ATTRIBUTE}",why)}catch(e){}})();`;

/** True when this page is in agent mode. Browser only; false on the server. */
export function isAgent(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(AGENT_ATTRIBUTE);
}

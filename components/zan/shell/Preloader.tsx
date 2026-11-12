import { PreloaderStage } from "./PreloaderStage";

/**
 * Runs while the HTML is still being parsed, right after the preloader's own
 * markup: a visitor who has already seen it this session, or who prefers
 * reduced motion, gets a <style> that hides it before first paint — and the
 * preloaded flag, so the navbar does not wait for an event that never comes.
 *
 * An automated browser gets the same skip. This only skips it for
 * navigator.webdriver, so that agents are not blocked: an agent acts as soon as
 * the page has loaded, and for the next few seconds its clicks would land on
 * this cover. People see exactly the same preloader, with the same timing.
 * PreloaderStage makes the same check.
 *
 * First it sets the performance mark "zan.preloader" (COVER_MARK in
 * PreloaderStage.tsx). A script in the page waits for the stylesheets, so
 * this one runs just before the cover's first frame, which is where the
 * cover's fallback counts from. A browser without getAnimations() has no
 * other way to tell whether that fallback has begun, and PreloaderStage
 * counts from this mark there.
 *
 * It injects a style rather than removing the node: React still has to find
 * the node to hydrate it.
 */
const SKIP_SCRIPT = `(function(){try{var d=document,r=d.documentElement,s=false;try{performance.mark('zan.preloader')}catch(e){}try{s=sessionStorage.getItem('zan.preloader.seen')==='1'}catch(e){}if(s||navigator.webdriver===true||window.matchMedia('(prefers-reduced-motion: reduce)').matches){var t=d.createElement('style');t.setAttribute('data-zan-preloader','skip');t.textContent='#zan-preloader{display:none!important}';d.head.appendChild(t);r.setAttribute('data-preloaded','1')}}catch(e){}})();`;

/**
 * First-visit preloader. A server component, so the skip script is part of
 * the server HTML and is only ever hydrated, never created on the client.
 *
 * It does not hold the page for long. If its script has not started the
 * sequence by --zan-pl-fallback-at after the first frame, the cover fades out
 * by itself (preloader.css), and the header and the homepage hero's copy come
 * in with it. A script that arrives after that finishes the job without
 * playing anything again (PreloaderStage).
 */
export function Preloader() {
  return (
    <>
      <PreloaderStage />
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
    </>
  );
}

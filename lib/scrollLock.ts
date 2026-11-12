import { getLenis } from "@/hooks/useLenis";

let htmlHolds = 0;
let bodyHolds = 0;
const saved = { html: "", body: "" };

/**
 * Stops the page scrolling while something covers it: overflow hidden on
 * <html>, and on <body> unless `body` is false, and Lenis stopped.
 *
 * Counted, so with two open at once, as the timed popup over the phone menu can
 * be, the page comes back only when the last one closes. Each overlay used to
 * put back what it had found, so the one that closed last put back the other's
 * "hidden", and the page could not be scrolled again until a reload.
 *
 * <html> and <body> are counted apart because the preloader holds only <html>,
 * as it always has, while the overlays hold both, as they always have.
 *
 * Returns the release, which does nothing a second time.
 */
export function lockScroll({ body: withBody = true }: { body?: boolean } = {}): () => void {
  const html = document.documentElement;
  const { body } = document;
  if (htmlHolds++ === 0) {
    saved.html = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
  }
  if (withBody && bodyHolds++ === 0) {
    saved.body = body.style.overflow;
    body.style.overflow = "hidden";
  }
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    if (withBody && --bodyHolds === 0) body.style.overflow = saved.body;
    if (--htmlHolds > 0) return;
    html.style.overflow = saved.html;
    getLenis()?.start();
  };
}

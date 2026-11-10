import { getLenis } from "@/hooks/useLenis";
import { EARLY_INPUT_ATTRIBUTE, movesPage } from "@/lib/earlyInput";
import { ScrollTrigger } from "@/lib/gsap";
import { PRELOADED_EVENT } from "./shellStore";

/**
 * How long a target is held after the page is uncovered, and after each
 * ScrollTrigger refresh from then on: on a slow phone the scenes that grow the
 * page can be built well after hydration. Never longer than MAX_MS in all.
 */
const HOLD_MS = 6000;
const MAX_MS = 20000;
/**
 * Any of these, once the page is uncovered, means a person has taken over, and
 * the hold ends at once. So does a key that scrolls or moves focus
 * (lib/earlyInput.ts movesPage).
 */
const TAKEOVER = ["wheel", "touchstart", "pointerdown"] as const;

/**
 * The browser's own find: Ctrl or Cmd with F or G, F3, and Firefox's quick find,
 * / or ', outside a field. The visitor is searching, so the hold lets go. Not in
 * lib/earlyInput.ts, where the find that opened an answer must keep its hold.
 */
function findsInPage(e: KeyboardEvent): boolean {
  const key = typeof e.key === "string" ? e.key : "";
  // On an Arabic or Russian layout the key is that layout's letter, even with
  // Ctrl held, so the physical key decides.
  const k = /^[a-z]$/i.test(key) ? key.toLowerCase() : e.code === "KeyF" ? "f" : e.code === "KeyG" ? "g" : "";
  if ((e.ctrlKey || e.metaKey) && (k === "f" || k === "g")) return true;
  if (key === "F3") return true;
  if ((key === "/" || key === "'") && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const t = e.target as HTMLElement | null;
    return !(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
  }
  return false;
}

/**
 * Where an element sits in the page with no transform applied, less its scroll
 * margin: the offsetTop chain. Null inside a fixed box, where the chain stops.
 */
function placeOf(el: HTMLElement): number | null {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    y += n.offsetTop;
    const next = n.offsetParent as HTMLElement | null;
    if (!next && n !== document.body && getComputedStyle(n).position === "fixed") return null;
    n = next;
  }
  return y - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
}

/**
 * A page opened on one part of it. The browser jumps to that part when the page
 * first loads, and then the scroll scenes make the page taller, which leaves it
 * thousands of pixels below the screen. A click on the same link inside the site
 * works, because by then the page is built.
 *
 * So the target is scrolled to again after each ScrollTrigger refresh, since a
 * scene that grows the page ends in one, and once more when the preloader leaves.
 * It uses the call a click uses (Lenis honours scroll-margin-top), or a plain
 * jump where there is no Lenis, which is reduced motion. It holds for HOLD_MS
 * from the moment the page is uncovered, and the visitor taking over ends it at
 * once, so it never fights someone who has started to scroll. Input counts
 * once the page is uncovered, because under the preloader nothing can scroll:
 * the wheel, a touch, a press, or a key that scrolls or moves focus
 * (lib/earlyInput.ts movesPage). So does the browser's find: its keys, and an
 * answer it opens elsewhere. A target that has left the page ends it too.
 *
 * For a section link (RouteChange.tsx), and for an answer that the browser's
 * find opened before hydration (components/zan/contact/FaqAccordion.tsx).
 * `ignoreTransforms` lands on the target's place in the layout rather than on
 * its moving box, for a row that rises into place as it fades in: the page
 * would otherwise follow the rise, and the row would appear without it.
 * Returns the function that ends it.
 */
export function holdTarget(
  find: () => HTMLElement | null,
  { ignoreTransforms = false }: { ignoreTransforms?: boolean } = {},
): () => void {
  // No preloader this time, so the page could be scrolled from its first paint,
  // and the visitor already scrolled, tapped or typed before hydration
  // (lib/earlyInput.ts): they have taken over, so nothing is held.
  const root = document.documentElement;
  if (root.dataset.preloaded === "1" && root.hasAttribute(EARLY_INPUT_ATTRIBUTE)) return () => {};

  const land = () => {
    const target = find();
    if (!target) return;
    if (!target.isConnected) {
      // Not inside ScrollTrigger's own dispatch of the refresh, which removing a
      // listener would cut short for the listeners after this one.
      queueMicrotask(stop);
      return;
    }
    const y = ignoreTransforms ? placeOf(target) : null;
    const lenis = getLenis();
    if (lenis) {
      // A refresh can leave Lenis holding an old page height, which would cap
      // the scroll short of the target, and an old scroll position.
      lenis.resize();
      lenis.scrollTo(y ?? target, { immediate: true, force: true });
    } else if (y !== null) {
      window.scrollTo(0, y);
    } else {
      target.scrollIntoView();
    }
  };

  /* A panel opening or closing above the target moves it with no refresh. The
     FAQ closes the answer open by default as the found one opens, and that one
     sits above it: on a slow phone the hold had landed before it closed, and the
     found answer ended up 200 px out of view. While such a transition runs, the
     target is followed frame by frame, so it stays where it landed, and it lands
     once more when the transition ends. */
  let running = 0;
  let frame = 0;
  const follow = () => {
    land();
    frame = running > 0 ? requestAnimationFrame(follow) : 0;
  };
  // Only an FAQ panel: other grid-row transitions, such as the work wall's hover
  // reveal, sit inside boxes of a fixed size and move nothing.
  const panelOf = (e: TransitionEvent) =>
    e.propertyName === "grid-template-rows" && e.target instanceof Element && e.target.closest(".zan-faq-panel") !== null;
  const onRun = (e: TransitionEvent) => {
    if (!panelOf(e)) return;
    running++;
    if (!frame) frame = requestAnimationFrame(follow);
  };
  const onEnd = (e: TransitionEvent) => {
    if (!panelOf(e) || running === 0) return;
    running--;
    if (running === 0) land();
  };

  let timer = 0;
  const onKey = (e: KeyboardEvent) => {
    if (movesPage(e) || findsInPage(e)) stop();
  };
  let listening = false;
  const listen = () => {
    if (listening) return;
    listening = true;
    for (const type of TAKEOVER) window.addEventListener(type, stop, { passive: true });
    window.addEventListener("keydown", onKey);
  };
  // Ends the hold HOLD_MS from now, replacing any earlier end, but never later
  // than MAX_MS after the page was uncovered. First called when the page is
  // uncovered, which is also when input starts to count.
  let uncoveredAt = 0;
  const runOut = () => {
    listen();
    if (!uncoveredAt) uncoveredAt = performance.now();
    window.clearTimeout(timer);
    const left = Math.min(HOLD_MS, MAX_MS - (performance.now() - uncoveredAt));
    timer = window.setTimeout(stop, Math.max(0, left));
  };
  // A refresh lands it again, and, once the page is uncovered, keeps it held for
  // HOLD_MS more: the page may still be growing.
  const onRefresh = () => {
    land();
    if (listening) runOut();
  };
  const onPreloaded = () => {
    land();
    runOut();
  };
  function stop() {
    window.clearTimeout(timer);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    window.removeEventListener(PRELOADED_EVENT, onPreloaded);
    window.removeEventListener("hashchange", stop);
    for (const type of TAKEOVER) window.removeEventListener(type, stop);
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("beforematch", stop, true);
    document.removeEventListener("transitionrun", onRun, true);
    document.removeEventListener("transitionend", onEnd, true);
    document.removeEventListener("transitioncancel", onEnd, true);
    cancelAnimationFrame(frame);
    frame = 0;
    running = 0;
  }

  ScrollTrigger.addEventListener("refresh", onRefresh);
  window.addEventListener("hashchange", stop);
  // The visitor's own search: the find opens a hidden answer, and then scrolls to
  // it. It sends no key the page can see, so this is the only sign of it.
  document.addEventListener("beforematch", stop, true);
  document.addEventListener("transitionrun", onRun, true);
  document.addEventListener("transitionend", onEnd, true);
  document.addEventListener("transitioncancel", onEnd, true);

  // Under the preloader the clock has not started: a slow load can outlast it.
  if (document.documentElement.dataset.preloaded === "1") runOut();
  else window.addEventListener(PRELOADED_EVENT, onPreloaded);

  return stop;
}

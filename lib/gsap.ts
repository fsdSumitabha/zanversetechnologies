import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isAgent } from "./agentMode";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // The mobile URL bar showing and hiding resizes the viewport on every
  // direction change. Refreshing on that re-measures every pin mid-scroll and
  // makes pinned scenes jump; the layout has not actually changed.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };

/* An agent (lib/agentMode.ts) takes the reduced-motion path everywhere: for
   it `motion` is a query that can never match and `reduce` one that always
   does. Both are still real media queries, so they combine with "and" like the
   others. Read when used, not when this module loads, so the attribute the
   head script sets is always there by then. */
const NEVER = "(prefers-reduced-motion: reduce) and (prefers-reduced-motion: no-preference)";
const ALWAYS = "(min-width: 0px)";

/**
 * Media conditions for gsap.matchMedia(). Every pinned or scrubbed scene
 * builds inside `MQ.motion`, so a visitor who prefers reduced motion gets the
 * static layout — matchMedia reverts the scene for them automatically, which
 * a one-off `matchMedia().matches` check in an effect does not. An agent gets
 * the same static layout (see NEVER and ALWAYS above).
 */
export const MQ = {
  get motion(): string {
    return isAgent() ? NEVER : "(prefers-reduced-motion: no-preference)";
  },
  get reduce(): string {
    return isAgent() ? ALWAYS : "(prefers-reduced-motion: reduce)";
  },
  desktop: "(min-width: 1024px)",
  mobile: "(max-width: 1023.98px)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export const EASES = {
  smooth: "power3.out",
  snappy: "power4.out",
  elastic: "elastic.out(1, 0.3)",
  back: "back.out(1.7)",
  expo: "expo.out",
  circ: "circ.out",
};

export const DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.0,
  cinematic: 1.4,
};

export function createScrollReveal(
  target: gsap.TweenTarget,
  options: gsap.TweenVars = {},
  scrollOptions: ScrollTrigger.Vars = {}
) {
  return gsap.fromTo(
    target,
    { y: 60, opacity: 0, ...options },
    {
      y: 0,
      opacity: 1,
      duration: DURATIONS.cinematic,
      ease: EASES.smooth,
      scrollTrigger: {
        trigger: target as Element,
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...scrollOptions,
      },
      ...options,
    }
  );
}

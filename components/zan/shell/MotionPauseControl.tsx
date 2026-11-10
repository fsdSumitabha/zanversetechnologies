"use client";

import { setMotionPaused } from "@/lib/motionPause";
import { useMotionPaused } from "@/lib/useMotionPaused";

/**
 * The switch for everything that moves by itself. WCAG 2.2.2 asks for one, and
 * the page's look must not change for it, so it works like the skip link: out of
 * sight, in the same place in the tab order, and the same pill as that link once
 * a keyboard lands on it. A mouse or touch visitor never sees it.
 *
 * Pausing sets `html[data-motion-paused]`, which stops the CSS loops
 * (app/globals.css), and the hero's typing and the Industries carousel read the
 * same value. A saved choice is restored on mount: the hook's first read of
 * lib/motionPause.ts loads it and sets the attribute. Server and first client
 * render both say "Pause animations"; the saved choice follows after hydration.
 */
export function MotionPauseControl() {
  const paused = useMotionPaused();

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setMotionPaused(!paused)}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-full focus:bg-action focus:px-5 focus:py-3 focus:text-small focus:text-action-foreground"
    >
      {paused ? "Play animations" : "Pause animations"}
    </button>
  );
}

"use client";

import { MarqueeToggle } from "@/components/zan/work/MarqueeToggle";
import { setMotionPaused } from "@/lib/motionPause";
import { useMotionPaused } from "@/lib/useMotionPaused";

/**
 * The switch for everything that moves by itself, which WCAG 2.2.2 asks for. On
 * every page it works like the skip link: out of sight, in the same place in the
 * tab order, and the same pill as that link once a keyboard lands on it.
 *
 * The homepage also shows the switch: MotionPauseToggle below is a round button
 * in the hero's lower left (opening/HeroScene.tsx), where the typing and the
 * floating mark move by themselves. Both read and set the one value, so a press
 * on either one updates the other.
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

/**
 * The same switch on show, for the homepage hero. It wears MarqueeToggle's look,
 * so it reads as one of the site's pause buttons: the name stays "Pause
 * animations" and aria-pressed says whether they are paused. Hidden for reduced
 * motion, where nothing moves. Like the pill, it renders as playing on the
 * server and during hydration, and shows a saved pause straight after.
 */
export function MotionPauseToggle({ className }: { className?: string }) {
  const paused = useMotionPaused();

  return (
    <MarqueeToggle
      paused={paused}
      onToggle={() => setMotionPaused(!paused)}
      label="Pause animations"
      className={className}
    />
  );
}

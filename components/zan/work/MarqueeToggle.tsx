"use client";

import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The quiet pause/play toggle for anything that moves by itself (WCAG 2.2.2):
 * the auto-moving strips, the Industries carousel, and in the homepage hero
 * the switch for every animation on the site (shell/MotionPauseControl.tsx).
 * The accessible name stays fixed and aria-pressed carries the state; the
 * global :focus-visible ring marks it for keyboard users. Hidden for reduced
 * motion, where nothing moves.
 */
export function MarqueeToggle({
  paused,
  onToggle,
  label,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  /** e.g. "Pause the client logos" — pressed means paused. */
  label: string;
  className?: string;
}) {
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={label}
      title={paused ? "Play" : "Pause"}
      onClick={onToggle}
      className={cn(
        "inline-grid size-11 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-muted md:size-9",
        "transition-colors duration-300 hover:border-foreground hover:text-foreground motion-reduce:hidden",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} fill="currentColor" />
    </button>
  );
}

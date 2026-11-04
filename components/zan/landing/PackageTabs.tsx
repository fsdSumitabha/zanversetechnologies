"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One group of packages at a time, for a page that sells several.
 *
 * The cards are server-rendered and handed in as they are, so this adds no
 * drawings or copy to the script: every panel is in the HTML, the ones not chosen
 * are `hidden`, and the cards' own reveal plays as a panel opens.
 *
 * All four tabs stay on screen at every width, two by two on a phone, rather than
 * scrolling sideways out of sight: on a page like this the tabs are also the
 * answer to "what do you do?". They follow the WAI-ARIA pattern: one tab stop,
 * with the arrow keys, Home and End moving between them.
 */
export function PackageTabs({
  label,
  tabs,
  panels,
}: {
  label: string;
  tabs: readonly { label: string; covers: string }[];
  panels: readonly ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const choose = (next: number) => {
    setActive(next);
    listRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : e.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    choose(next);
  };

  return (
    <>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:mt-12 lg:grid-cols-4"
      >
        {tabs.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.label}
              id={`${base}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${base}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "group relative flex min-w-0 flex-col items-start px-4 py-4 text-left transition-colors duration-300 sm:px-6 sm:py-5",
                selected ? "bg-surface" : "bg-surface-muted hover:bg-surface",
              )}
            >
              <span className={cn("font-mono text-eyebrow", selected ? "text-accent-ink" : "text-subtle")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "mt-2.5 font-display text-h3 font-semibold transition-colors duration-300",
                  selected ? "text-foreground" : "text-muted group-hover:text-foreground",
                )}
              >
                {tab.label}
              </span>
              <span className="mt-1 text-[0.8125rem] leading-snug text-subtle">{tab.covers}</span>
              {selected && (
                <motion.span
                  layoutId={`${base}-rule`}
                  aria-hidden="true"
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-accent-gradient"
                />
              )}
            </button>
          );
        })}
      </div>

      {panels.map((panel, i) => (
        <div
          key={tabs[i].label}
          id={`${base}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${i}`}
          hidden={i !== active}
          className="mt-8"
        >
          {panel}
        </div>
      ))}
    </>
  );
}

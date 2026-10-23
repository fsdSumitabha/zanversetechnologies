"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   The controls on top of the rail. The track itself is a native scroll
   container (team.css) holding server-rendered cards, so it swipes, snaps and
   takes the arrow keys on its own; this file adds what native scrolling does
   not give you — prev/next buttons that know when they have run out of rail,
   a progress line, a mouse drag, and the live region that says where you are.

   Nothing here draws the cards. They are passed in as children from the server
   component, so their markup never ships to the browser.

   Deliberately NOT the industries rotator. That 3D deck is already on this
   page; a second one would make the page read as one trick repeated. This is a
   flat rail, and under prefers-reduced-motion the CSS turns it into a grid and
   hides these controls altogether.
   ─────────────────────────────────────────────────────────────────────────── */

/** Where the track's content starts: its left edge plus the page gutter. */
function anchorOf(track: HTMLElement) {
  const pad = parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
  return track.getBoundingClientRect().left + pad;
}

/** The card currently sitting at (or nearest to) that start line. */
function leadingCard(track: HTMLElement) {
  const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-person]"));
  const anchor = anchorOf(track);
  let index = 0;
  let best = Infinity;
  cards.forEach((el, i) => {
    const d = Math.abs(el.getBoundingClientRect().left - anchor);
    if (d < best) {
      best = d;
      index = i;
    }
  });
  return { cards, index };
}

export function TeamRail({
  label,
  names,
  children,
}: {
  /** The rail's accessible name. */
  label: string;
  /** Everyone, in track order, for the live region. */
  names: readonly string[];
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [at, setAt] = useState({ index: 0, start: true, end: false });

  /* Position, read on a frame and written straight to the progress line. Only
     the three values the buttons and the live region depend on go to React,
     and only when one of them actually changes. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;

    const read = () => {
      raf = 0;
      const span = track.scrollWidth - track.clientWidth;
      const x = track.scrollLeft;
      const bar = barRef.current;
      if (bar) {
        const w = Math.min(1, track.clientWidth / track.scrollWidth);
        bar.style.width = `${(w * 100).toFixed(2)}%`;
        bar.style.marginInlineStart = `${((span > 0 ? x / span : 0) * (1 - w) * 100).toFixed(2)}%`;
      }
      const { index } = leadingCard(track);
      const start = x <= 1;
      const end = x >= span - 1;
      setAt((prev) => (prev.index === index && prev.start === start && prev.end === end ? prev : { index, start, end }));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(track);
    track.addEventListener("scroll", schedule, { passive: true });
    read();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      track.removeEventListener("scroll", schedule);
    };
  }, []);

  /** One card forward or back. */
  const go = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const { cards, index } = leadingCard(track);
    const target = cards[Math.max(0, Math.min(cards.length - 1, index + dir))];
    if (!target) return;
    /* No `behavior`: the track's own scroll-behavior decides, and the reduced
       motion rule in globals.css has already turned that one to auto. */
    track.scrollTo({ left: track.scrollLeft + target.getBoundingClientRect().left - anchorOf(track) });
  }, []);

  /* Mouse drag, and the arrow keys moving a card at a time rather than the
     few pixels a focused scroll container moves by default. Touch is left
     alone: the browser already does it better. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.dataset.drag = "on";

    let pointer = -1;
    let fromX = 0;
    let fromLeft = 0;
    let moved = 0;
    let swallow = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      pointer = e.pointerId;
      fromX = e.clientX;
      fromLeft = track.scrollLeft;
      moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - fromX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved < 4) return;
      if (!track.hasPointerCapture(e.pointerId)) {
        track.setPointerCapture(e.pointerId);
        track.dataset.grabbing = "true";
        // Snapping re-runs on every scrollLeft write, which fights the hand.
        track.style.scrollSnapType = "none";
      }
      track.scrollLeft = fromLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = -1;
      delete track.dataset.grabbing;
      track.style.scrollSnapType = "";
      if (moved <= 6) return;
      // A drag that ended over a mail or LinkedIn link must not open it.
      swallow = true;
      setTimeout(() => {
        swallow = false;
      }, 0);
      const { cards, index } = leadingCard(track);
      const target = cards[index];
      if (target) track.scrollTo({ left: track.scrollLeft + target.getBoundingClientRect().left - anchorOf(track) });
    };
    const click = (e: MouseEvent) => {
      if (!swallow) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== track) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else return;
      e.preventDefault();
    };

    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("click", click, true);
    track.addEventListener("keydown", key);

    return () => {
      delete track.dataset.drag;
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("click", click, true);
      track.removeEventListener("keydown", key);
    };
  }, [go]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={label}
        /* It scrolls inside itself, so Lenis has to keep its hands off it. */
        data-lenis-prevent
        className="zan-team-rail"
      >
        {children}
      </ul>

      <div className="zan-team-controls container-zan mt-1 flex items-center gap-6">
        <span aria-hidden="true" className="h-[3px] grow overflow-hidden rounded-full bg-line">
          <span ref={barRef} className="block h-full rounded-full bg-brand" style={{ width: "30%" }} />
        </span>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={at.start}
            aria-label="Previous team member"
            className="grid size-11 place-items-center rounded-full border border-line bg-bg text-ink shadow-lift transition-[color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand hover:text-brand-ink disabled:pointer-events-none disabled:border-line disabled:opacity-35 disabled:shadow-none"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={at.end}
            aria-label="Next team member"
            className="grid size-11 place-items-center rounded-full border border-line bg-bg text-ink shadow-lift transition-[color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand hover:text-brand-ink disabled:pointer-events-none disabled:border-line disabled:opacity-35 disabled:shadow-none"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${at.index + 1} of ${names.length}: ${names[at.index] ?? ""}`}
      </p>
    </div>
  );
}

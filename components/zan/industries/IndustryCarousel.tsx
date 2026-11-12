"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MarqueeToggle } from "@/components/zan/work/MarqueeToggle";
import { gsap, MQ } from "@/lib/gsap";
import { isMotionPaused, subscribeMotionPause } from "@/lib/motionPause";

/* ───────────────────────────────────────────────────────────────────────────
   INDUSTRY CAROUSEL — one list of cards, three behaviours.

   • ≥768px, motion allowed: a 3D rotator. The <ul> carries the perspective
     and every <li> is absolutely centred; a rAF loop writes one
     translate3d + rotateY per card from a single continuous position, so the
     deck curves away on both sides. Driven by pointer drag, horizontal
     wheel/trackpad, clicking a side card, the prev/next buttons, the dots and
     the arrow keys. It loops: the last card is followed by the first.
   • <768px: the same <ul> is a CSS scroll-snap track — one card per screen,
     native momentum, swipeable, the same controls.
   • prefers-reduced-motion: reduce: the same <ul> is a plain grid of all the
     cards, no transforms, controls hidden.

   The three layouts are CSS (industries.css); this file only adds transforms
   when the rotator is the live mode, so there is no layout flash on hydration
   and every card is in the server HTML.

   A keyboard and a screen reader meet the rotator through its front card, the
   arrows and the live region. The cards behind the front one are partly covered,
   so setFront below takes them out of the tab order and the tree as the deck
   turns; a pointer still acts on them. The slider and the grid leave every card
   reachable.

   The dots are a pointer shortcut to what the arrows do. WCAG 2.5.8 accepts a
   small control when an equivalent one on the page is large enough, and the
   arrows are, so the dots are out of the tab order and the tree in every mode.

   Only the rotator turns by itself, every 3 s. Autoplay holds while a mouse is
   over the carousel (the deck or its controls), during a drag, while keyboard
   focus is in the deck, while the deck is mostly off screen or the tab is
   hidden, and while either pause is on: the carousel's own button, first in
   the control row, or the page's Pause animations (lib/motionPause.ts). WCAG
   2.2.2 asks for a visible way to stop it, and the button is that. It shows
   only with the rotator (industries.css), because the slider and the grid
   never move on their own.
   ─────────────────────────────────────────────────────────────────────────── */

export interface CarouselItem {
  key: string;
  /** Used for the live region and the dot labels. */
  label: string;
  node: ReactNode;
  media?: ReactNode;
}

/** Sideways travel of the first neighbour, as a fraction of a card's width. */
const STEP_NEAR = 0.7;
/** Extra travel for each card beyond the first neighbour. */
const STEP_FAR = 0.42;
/** Degrees of rotateY at the first neighbour; the deck faces inward. */
const ROT = 34;
/** Depth, in px, that each step recedes. */
const Z_STEP = 150;
/** Cards further than this from the centre are not painted. */
const VISIBLE = 3.4;
/** Autoplay interval. A mouse over the carousel, a drag, keyboard focus inside,
    the carousel's own pause button or the page's pause control holds it (see
    the header), and a turn the visitor makes restarts the count. */
const AUTOPLAY_MS = 3000;

export function IndustryCarousel({ items, label }: { items: readonly CarouselItem[]; label: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const apiRef = useRef<{ go: (d: number) => void; to: (i: number) => void; sync: () => void } | null>(null);
  const [active, setActive] = useState(0);
  /** The carousel's own pause button. Read by the effect below through the ref. */
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const total = items.length;

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>("li[data-i]"));
    const n = slides.length;
    if (!n) return;

    const mqDesk = window.matchMedia("(min-width: 768px)");
    const mqReduce = window.matchMedia(MQ.reduce);

    let mode = "";
    let pos = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    let cardW = slides[0].offsetWidth || 300;
    let idx = 0;

    const mod = (v: number) => ((v % n) + n) % n;
    const shortest = (delta: number) => {
      const d = mod(delta);
      return d > n / 2 ? d - n : d;
    };
    const publish = (i: number) => {
      if (i === idx) return;
      idx = i;
      setActive(i);
    };

    /* ── what a keyboard and a screen reader reach ───────────────────────── */

    const links = slides.map((el) => Array.from(el.querySelectorAll<HTMLElement>("a[href]")));
    /* Safari focuses a link on a press only if it has a tabindex, which the links
       behind the front card now do. Chrome and Firefox always focused it. So in
       Safari that focus must not turn the deck, which it never did there. */
    const pressNewlyFocuses = navigator.vendor.startsWith("Apple");
    let front: number | null = null;
    /** Only card `i` stays reachable; null leaves them all reachable. Written to the
        DOM, and only when the front card changes. Not inert: inert would also stop
        a hover or a drag that starts on one of these cards. */
    const setFront = (i: number | null) => {
      if (i === front) return;
      front = i;
      if (i !== null) {
        // A card must not be hidden from the tree with focus inside it, so focus
        // steps back to the deck first. The next Tab goes on from there.
        const holder = document.activeElement?.closest("li[data-i]");
        if (holder && holder !== slides[i] && track.contains(holder)) track.focus({ preventScroll: true });
      }
      slides.forEach((el, k) => {
        const reachable = i === null || k === i;
        if (reachable) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", "true");
        for (const link of links[k]) {
          if (reachable) link.removeAttribute("tabindex");
          else link.tabIndex = -1;
        }
      });
    };

    /* ── the rotator ─────────────────────────────────────────────────────── */

    const paint = () => {
      for (let i = 0; i < n; i++) {
        const el = slides[i];
        let d = mod(i - pos);
        if (d > n / 2) d -= n;
        const a = Math.abs(d);
        const scrim = el.firstElementChild?.querySelector<HTMLElement>("[data-scrim]") ?? null;
        if (a > VISIBLE) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.zIndex = "0";
          el.style.transform = "translate3d(0,0,-1200px)";
          continue;
        }
        const s = Math.sign(d);
        const x = s * cardW * (STEP_NEAR * Math.min(a, 1) + STEP_FAR * Math.max(a - 1, 0));
        const z = -a * Z_STEP;
        const ry = Math.max(-1.35, Math.min(1.35, d)) * ROT;
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
        el.style.opacity = (a <= 2.3 ? 1 : Math.max(0, 1 - (a - 2.3) / 1.1)).toFixed(3);
        el.style.zIndex = String(200 - Math.round(a * 20));
        el.style.pointerEvents = "auto";
        if (scrim) scrim.style.opacity = (Math.min(a, 2) * 0.17).toFixed(3);
      }
      publish(mod(Math.round(pos)));
      setFront(idx);
    };

    const tick = (now: number) => {
      const dt = Math.min(50, now - last) || 16;
      last = now;
      pos += (target - pos) * (1 - Math.pow(0.002, dt / 1000));
      if (Math.abs(target - pos) < 0.0008) {
        pos = target;
        paint();
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const halt = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    /* ── the phone slider ────────────────────────────────────────────────── */

    const centre = (i: number, behavior: ScrollBehavior) => {
      const el = slides[i];
      if (!el) return;
      const tr = track.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      track.scrollTo({ left: track.scrollLeft + (er.left - tr.left) - (tr.width - er.width) / 2, behavior });
    };
    let scrollRaf = 0;
    const onScroll = () => {
      if (mode !== "slider" || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const tr = track.getBoundingClientRect();
        const c = tr.left + tr.width / 2;
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < n; i++) {
          const r = slides[i].getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - c);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        publish(best);
      });
    };

    /* ── shared commands ─────────────────────────────────────────────────── */

    const to = (i: number) => {
      if (mode === "slider") return centre(i, "smooth");
      if (mode !== "rotator") return;
      target = Math.round(target) + shortest(i - mod(Math.round(target)));
      run();
    };
    const go = (dir: number) => {
      if (mode === "slider") return centre(Math.max(0, Math.min(n - 1, idx + dir)), "smooth");
      if (mode !== "rotator") return;
      target = Math.round(target) + dir;
      run();
    };

    /* ── autoplay (rotator only) ─────────────────────────────────────────── */

    let timer = 0;
    let inView = false;
    let keyFocus = false; // focus inside that came from the keyboard, not a click
    let hovered = false; // a mouse over the stage: the deck or its controls
    const syncAuto = () => {
      const wanted =
        inView &&
        !keyFocus &&
        !hovered &&
        !dragging &&
        !pausedRef.current &&
        !document.hidden &&
        mode === "rotator" &&
        !isMotionPaused();
      if (wanted && !timer) timer = window.setInterval(() => go(1), AUTOPLAY_MS);
      if (!wanted && timer) {
        clearInterval(timer);
        timer = 0;
      }
    };
    /** The visitor turned the deck, so the next automatic turn waits a full interval. */
    const restartAuto = () => {
      if (timer) clearInterval(timer);
      timer = 0;
      syncAuto();
    };

    /* What the buttons and dots under the deck call, and the pause button's
       effect below. */
    apiRef.current = {
      go: (d) => {
        restartAuto();
        go(d);
      },
      to: (i) => {
        restartAuto();
        to(i);
      },
      sync: syncAuto,
    };

    /* ── mode ────────────────────────────────────────────────────────────── */

    const setMode = () => {
      const next = mqReduce.matches ? "static" : mqDesk.matches ? "rotator" : "slider";
      if (next === mode) return;
      mode = next;
      halt();
      setFront(null);
      for (const el of slides) {
        el.style.cssText = "";
        const scrim = el.firstElementChild?.querySelector<HTMLElement>("[data-scrim]");
        if (scrim) scrim.style.opacity = "";
      }
      if (next === "rotator") {
        cardW = slides[0].offsetWidth || 300;
        pos = target = idx;
        paint();
      } else if (next === "slider") {
        centre(idx, "auto");
      }
      syncAuto();
    };

    const onResize = () => {
      if (mode !== "rotator") return;
      const w = slides[0].offsetWidth;
      if (w && w !== cardW) {
        cardW = w;
        paint();
      }
    };

    /* ── pointer drag ────────────────────────────────────────────────────── */

    let dragging = false;
    let pid = -1;
    let startX = 0;
    let startPos = 0;
    let moved = 0;
    let vel = 0;
    let lastX = 0;
    let lastT = 0;
    let swallowClick = false;
    let captured = false;
    /** Past this a press is a drag, and the click at the end of it does nothing. */
    const DRAG_PX = 6;

    const onDown = (e: PointerEvent) => {
      if (mode !== "rotator" || e.button !== 0) return;
      dragging = true;
      pid = e.pointerId;
      startX = lastX = e.clientX;
      startPos = pos;
      moved = 0;
      vel = 0;
      lastT = performance.now();
      halt();
      syncAuto(); // held until the pointer lets go
      /* The window hears the rest of the press, because the pointer is not
         captured yet and can leave the track first. */
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      /* Captured only once this is a drag. A capture taken on the press sends the
         click that follows to the track, so a click on a card never reached it:
         the front card's link did not go anywhere, and a side card did not turn
         the deck. */
      if (moved > DRAG_PX && !captured) {
        captured = true;
        try {
          track.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) vel = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
      pos = startPos - dx / (cardW * STEP_NEAR);
      paint();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (captured) {
        captured = false;
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      const projected = Math.max(-1.6, Math.min(1.6, (-vel / (cardW * STEP_NEAR)) * 180));
      target = Math.round(pos + projected);
      run();
      syncAuto(); // a full interval from the release
      if (moved > DRAG_PX) {
        swallowClick = true;
        setTimeout(() => {
          swallowClick = false;
        }, 0);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (mode !== "rotator") return;
      const el = (e.target as Element | null)?.closest?.("li[data-i]") as HTMLElement | null;
      if (!el) return;
      if (swallowClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const i = Number(el.dataset.i);
      if (mod(Math.round(pos)) !== i) {
        e.preventDefault();
        restartAuto();
        to(i);
      }
    };

    /* ── wheel, keys, focus, visibility ──────────────────────────────────── */

    let acc = 0;
    let accT = 0;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (mode !== "rotator") return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && !e.shiftKey) return; // vertical stays with the page
      e.preventDefault();
      const now = performance.now();
      if (now - accT > 220) acc = 0;
      accT = now;
      acc += horizontal ? e.deltaX : e.deltaY;
      if (now < lock || Math.abs(acc) < 42) return;
      restartAuto();
      go(acc > 0 ? 1 : -1);
      acc = 0;
      lock = now + 230;
    };

    const onKey = (e: KeyboardEvent) => {
      if (mode === "static") return;
      const k = e.key;
      if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "Home" && k !== "End") return;
      e.preventDefault();
      restartAuto();
      if (k === "ArrowRight") go(1);
      else if (k === "ArrowLeft") go(-1);
      else to(k === "Home" ? 0 : n - 1);
    };

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      keyFocus = !!t?.matches?.(":focus-visible"); // a Tab holds the deck; a click does not
      syncAuto();
      const el = t?.closest?.("li[data-i]") as HTMLElement | null;
      if (!el) return;
      if (mode === "rotator" && pressNewlyFocuses && !keyFocus) return;
      const i = Number(el.dataset.i);
      if (mode === "rotator" && mod(Math.round(target)) !== i) to(i);
      else if (mode === "slider") centre(i, "smooth");
    };
    const onFocusOut = () => {
      if (track.contains(document.activeElement)) return;
      keyFocus = false;
      syncAuto();
    };
    const onVisibility = () => syncAuto();

    /* A mouse resting on the carousel holds it, so a card being read, or a
       button being reached for, does not turn away. Only a mouse: a finger
       enters on the press and leaves on the lift, which says nothing about
       where anyone is looking. Leaving clears it whatever the pointer, as the
       logo loop does (components/ui/logo-loop.tsx). */
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovered = true;
      syncAuto();
    };
    const onPointerLeave = () => {
      hovered = false;
      syncAuto();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncAuto();
      },
      { threshold: 0.2 },
    );
    io.observe(track);

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("click", onClick, true);
    track.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("keydown", onKey);
    track.addEventListener("focusin", onFocusIn);
    track.addEventListener("focusout", onFocusOut);
    track.addEventListener("scroll", onScroll, { passive: true });
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    mqDesk.addEventListener("change", setMode);
    mqReduce.addEventListener("change", setMode);
    window.addEventListener("resize", onResize);
    const stopListeningForPause = subscribeMotionPause(syncAuto);

    setMode();

    return () => {
      halt();
      if (timer) clearInterval(timer);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      io.disconnect();
      apiRef.current = null;
      stopListeningForPause();
      setFront(null);
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClick, true);
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("keydown", onKey);
      track.removeEventListener("focusin", onFocusIn);
      track.removeEventListener("focusout", onFocusOut);
      track.removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      mqDesk.removeEventListener("change", setMode);
      mqReduce.removeEventListener("change", setMode);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* The pause button's state reaches the autoplay above through the ref, so a
     press stops or starts the timer without rebuilding the deck. Playing again
     waits a full interval before the next turn. */
  useEffect(() => {
    pausedRef.current = paused;
    apiRef.current?.sync();
  }, [paused]);

  /* The stage rises into place once, for visitors who allow motion. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(
        stage,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: stage, start: "top 88%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  const go = (d: number) => apiRef.current?.go(d);
  const to = (i: number) => apiRef.current?.to(i);

  return (
    <div ref={stageRef} className="zan-ind-stage relative">
      <span aria-hidden="true" className="zan-ind-ground" />

      <ul ref={trackRef} tabIndex={0} className="zan-ind-track" aria-label={label}>
        {items.map((item, i) => (
          <li key={item.key} data-i={i} className="zan-ind-slide">
            <div className="zan-ind-card">
              {item.media}
              {item.node}
              <span data-scrim="" aria-hidden="true" className="zan-ind-scrim" />
            </div>
          </li>
        ))}
      </ul>

      <div className="zan-ind-controls mt-10 flex items-center justify-center gap-5 sm:gap-7">
        {/* First in the row, so it comes first in the tab order after the deck,
            and it balances the counter at the other end. Shown only with the
            rotator, the one mode that turns by itself (industries.css). */}
        <MarqueeToggle
          paused={paused}
          onToggle={() => setPaused((p) => !p)}
          label="Pause the industries carousel"
          className="zan-ind-pause"
        />

        <button type="button" onClick={() => go(-1)} className="zan-ind-arrow" aria-label="Previous card">
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>

        {/* The blur: a press would otherwise leave focus inside this hidden list. */}
        <ul aria-hidden="true" className="flex items-center gap-1.5 sm:gap-2">
          {items.map((item, i) => (
            <li key={item.key}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => to(i)}
                onFocus={(e) => e.currentTarget.blur()}
                aria-label={item.label}
                aria-current={i === active ? "true" : undefined}
                className="zan-ind-dot"
              />
            </li>
          ))}
        </ul>

        <button type="button" onClick={() => go(1)} className="zan-ind-arrow" aria-label="Next card">
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>

        <p className="hidden font-mono text-eyebrow uppercase tabular-nums text-subtle sm:block">
          <span className="text-accent-ink">{String(active + 1).padStart(2, "0")}</span>
          <span className="px-1.5 text-border-strong">/</span>
          {String(total).padStart(2, "0")}
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${active + 1} of ${total}: ${items[active]?.label ?? ""}`}
      </p>
    </div>
  );
}

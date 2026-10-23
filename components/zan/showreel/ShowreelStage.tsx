"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MQ, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/hooks/useLenis";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { site } from "@/constants/zan";
import "@/components/zan/showreel/showreel.css";

/* ───────────────────────────────────────────────────────────────────────────
   THE STAGE — a picture under a sheet of page ground with the wordmark cut
   out of it, and the cut opening as you scroll.

   The mask, not background-clip: on a light page the reliable shape is an
   overlay that covers the viewport in --color-bg and has the word knocked out
   (mask: an opaque rect, the word painted black over it). Everything but the
   letters stays page ground, so the section reads as the page until the word
   opens.

   Sizing comes from the nested <svg>'s viewBox, not from a font size: the
   word is set once at a nominal 100 units, measured with getBBox(), and the
   viewBox is fitted around it with a margin. preserveAspectRatio keeps it
   centred and optically the same from 360px to 1920px, through a font swap,
   and in any aspect ratio.

   The opening zooms about the stem of an E, not the centre of the word. The
   centre of ZANVERSE falls between the V and the E, and growing from there
   would fill the screen with page ground rather than picture; the E's stem is
   a plain upright bar, so its middle is guaranteed to be ink. It grows from
   the lower half of the stem, level with the counter under the middle arm, so
   the only ink near that point is the bar itself. Where the stem is and how
   wide it runs are measured at runtime from the face in use (measureStem), so
   the scene survives a font swap. While the word grows, the stem drifts to
   the middle of the screen, which keeps the word centred early and means the
   bar only has to cover half the viewport, not all of it.

   Past roughly fifty times its size Chrome stops rasterising the glyph and the
   hole simply disappears, so a plain rect, laid exactly over the stem and
   grown with it, is always drawn under the word and carries the last part of
   the zoom. The word fades out once the rect alone covers the screen. On a
   window so wide that the glyph has to go before that, the sheet fades with
   the word instead, and the screen crossfades to the picture.
   ─────────────────────────────────────────────────────────────────────────── */

const WIDE_WORD = `${site.wordmark.lead}${site.wordmark.trail}`;
const STACK_TOP = site.wordmark.lead;
const STACK_BOTTOM = site.wordmark.trail;

/** The glyph the opening grows out of: the E nearest the middle of the word.
 *  -1 if there is none; the zoom then grows from the word's centre. */
function stemIndex(word: string) {
  const mid = (word.length - 1) / 2;
  let best = -1;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === "E" && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  return best;
}

const WIDE_STEM = stemIndex(WIDE_WORD);
const STACK_STEM = stemIndex(STACK_BOTTOM);

/** Baseline-to-baseline for the stacked layout, in nominal units. */
const STACK_LEAD = 94;
/** The nominal type size the word is set at, in user units. */
const NOMINAL = 100;
/** viewBox margin around the word, as a share of its width. */
const FIT_PAD = 0.055;
/** The E is drawn on a canvas at this size to be measured: a pixel is a
 *  sixth of a nominal unit, and the canvas draws the E exactly as the SVG
 *  does at its nominal 100 (checked against the rendered mask). */
const MEASURE_PX = 600;
/** The point the zoom grows about, as a share of the cap height above the
 *  baseline: level with the middle of the E's lower counter. */
const FOCUS_RISE = 0.3;
/** How far the rect stays inside the measured edges of the stem, in nominal
 *  units, so anti-aliasing never shows it beside the letter. */
const INSET = 0.12;
/** Fallbacks, as shares of the glyph's cell, for a browser where the canvas
 *  probe fails. Deliberately inside the stem: an under-read stem only grows
 *  the zoom, where an over-read one would show the rect beside the letter. */
const FALLBACK = { left: 0.1, width: 0.24, cap: 0.5 };
/** Chrome drops the glyph somewhere above ten thousand pixels of type, which
 *  would take the hole with it. The word hands over to the rect well before. */
const SAFE_GLYPH_PX = 7600;

const MASK_ID = "zan-showreel-knockout";

interface Stem {
  /** Edges of the stem's ink from the glyph's origin, nominal units. */
  left: number;
  right: number;
  /** Cap height above the baseline, nominal units. */
  cap: number;
}

/**
 * The E's stem, read off a canvas. measureText() alone will not do: for this
 * variable face its ink box puts the E's left edge most of a unit too far
 * left, which showed as a notch beside the stem halfway through the zoom. So
 * the E is drawn and read back: one row through the lower counter, where the
 * first run of ink is the stem, and one column down the stem for its top.
 */
function measureStem(probe: CanvasRenderingContext2D, font: string): Stem | null {
  const canvas = probe.canvas;
  const pad = Math.round(MEASURE_PX * 0.25);
  canvas.width = canvas.height = Math.round(MEASURE_PX * 1.1);
  probe.font = font;
  probe.textBaseline = "alphabetic";
  probe.fillStyle = "black";
  const base = canvas.height - pad;
  probe.fillText("E", pad, base);
  const ascent = probe.measureText("E").actualBoundingBoxAscent;
  if (!(ascent > 0)) return null;

  const row = probe.getImageData(0, Math.round(base - ascent * FOCUS_RISE), canvas.width, 1).data;
  let left = -1;
  let right = -1;
  for (let x = 0; x < canvas.width; x++) {
    const ink = row[x * 4 + 3] > 127;
    if (ink && left < 0) left = x;
    else if (!ink && left >= 0) {
      right = x;
      break;
    }
  }
  if (left < 0 || right < 0) return null;

  const column = probe.getImageData(Math.round((left + right) / 2), 0, 1, canvas.height).data;
  let top = -1;
  for (let y = 0; y < canvas.height; y++) {
    if (column[y * 4 + 3] > 127) {
      top = y;
      break;
    }
  }

  const unit = NOMINAL / MEASURE_PX;
  return { left: (left - pad) * unit, right: (right - pad) * unit, cap: (top >= 0 ? base - top : ascent) * unit };
}

type Props = {
  /** Mono eyebrow over the wordmark. */
  eyebrow: string;
  /** One line under it, if there is one worth saying. */
  line?: string;
  /** The picture inside the letters, from /public. Decorative. */
  still: string;
};

export function ShowreelStage({ eyebrow, line, still }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const innerRef = useRef<SVGSVGElement>(null);
  const wordRef = useRef<SVGGElement>(null);
  const wideRef = useRef<SVGTextElement>(null);
  const stackRef = useRef<SVGGElement>(null);
  const stackBottomRef = useRef<SVGTextElement>(null);
  const stemRef = useRef<SVGRectElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<SVGRectElement>(null);

  /* The picture's drift and its band of light are CSS animations. They run
     only while the section is near the viewport, so a page left open
     elsewhere does no work for them. Reduced motion has neither (CSS). */
  useEffect(() => {
    const root = rootRef.current;
    const film = filmRef.current;
    if (!root || !film) return;
    const io = new IntersectionObserver(
      // The last record is the current state. An observer can queue several
      // for one target between callbacks, and the first may be stale.
      (entries) => film.toggleAttribute("data-paused", !entries[entries.length - 1].isIntersecting),
      { rootMargin: "600px 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      // Measured in layout(), read by applyWord() and by the scene.
      const m = {
        cx: 0,
        cy: 0,
        /** The point the word grows about: on the E's stem. */
        fx: 0,
        fy: 0,
        /** The rect: the whole stem, so its centre sits `ry` above the focus. */
        stemW: 1,
        stemH: 1,
        ry: 0,
        vb: { x: 0, y: 0, w: 1, h: 1 },
        /* The part of user space the viewport actually shows. The viewBox is
           fitted to the word and is far wider than it is tall, so with
           "…meet" the screen reaches well past it on the short axis: clamping
           the rect to the viewBox would stop it short of the top and bottom
           edges and leave two bands of page ground behind. */
        vis: { x: 0, y: 0, w: 1, h: 1 },
        max: 24,
        swap: 24,
        /** The scale from which the rect alone covers the screen. */
        clearAt: 24,
      };
      const view = { scale: 1 };

      const applyWord = () => {
        const word = wordRef.current;
        const stem = stemRef.current;
        if (!word || !stem) return;

        const span = m.max - 1;
        const u = span > 0 ? Math.min(1, Math.max(0, (view.scale - 1) / span)) : 0;
        // The stem walks to the middle of the screen as it grows.
        const drift = Math.pow(u, 0.65);
        const dx = (m.cx - m.fx) * drift;
        const dy = (m.cy - m.fy) * drift;

        word.setAttribute(
          "transform",
          `translate(${dx} ${dy}) translate(${m.fx} ${m.fy}) scale(${view.scale}) translate(${-m.fx} ${-m.fy})`,
        );
        // The word thins out over the last fifth before the swap rather than
        // cutting, so the hand-over to the rect is a fade.
        const over = (view.scale - m.swap * 0.8) / (m.swap * 0.2);
        const wordAlpha = Math.min(1, Math.max(0, 1 - over));
        word.style.opacity = wordAlpha === 1 ? "" : String(wordAlpha);
        word.style.display = wordAlpha > 0 ? "" : "none";

        // If the glyph has to go before the rect covers the screen (a very
        // wide window), the sheet thins with it, so whatever page ground is
        // still on screen crossfades to the picture instead of the letter
        // flashing back to white. Driven by scale alone, so scrubbing back
        // retraces.
        sheetRef.current?.setAttribute("fill-opacity", String(m.clearAt > m.swap * 0.8 ? wordAlpha : 1));

        // The rect the zoom ends on: the stem, in the same place, grown with
        // the word and clipped to a little outside what the screen shows so
        // its numbers stay small however far the word has grown.
        const halfW = (m.stemW / 2) * view.scale;
        const halfH = (m.stemH / 2) * view.scale;
        const cx = m.fx + dx;
        const cy = m.fy + dy + m.ry * view.scale;
        const bleedX = m.vis.w * 0.25;
        const bleedY = m.vis.h * 0.25;
        const x0 = Math.max(cx - halfW, m.vis.x - bleedX);
        const x1 = Math.min(cx + halfW, m.vis.x + m.vis.w + bleedX);
        const y0 = Math.max(cy - halfH, m.vis.y - bleedY);
        const y1 = Math.min(cy + halfH, m.vis.y + m.vis.h + bleedY);
        stem.setAttribute("x", String(x0));
        stem.setAttribute("y", String(y0));
        stem.setAttribute("width", String(Math.max(0, x1 - x0)));
        stem.setAttribute("height", String(Math.max(0, y1 - y0)));
      };

      const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

      const layout = () => {
        const inner = innerRef.current;
        const overlay = overlayRef.current;
        const wide = wideRef.current;
        const stack = stackRef.current;
        if (!inner || !overlay || !wide || !stack) return;

        // Measuring needs the word rendered; applyWord() hides it once the
        // rect has taken over, and puts that back at the end of this pass.
        if (wordRef.current) wordRef.current.style.display = "";

        const useWide = getComputedStyle(wide).display !== "none";
        const active: SVGGraphicsElement = useWide ? wide : stack;
        const focusText = useWide ? wide : stackBottomRef.current;

        const box = active.getBBox();
        if (!box.width || !box.height) return;

        const pad = box.width * FIT_PAD;
        const vbW = box.width + pad * 2;
        const vbH = box.height + pad * 2;
        m.vb = { x: box.x - pad, y: box.y - pad, w: vbW, h: vbH };
        inner.setAttribute("viewBox", `${m.vb.x} ${m.vb.y} ${vbW} ${vbH}`);

        // Symmetric padding, so the centre of the word is the centre of the
        // screen and the drift target is simply that centre.
        m.cx = box.x + box.width / 2;
        m.cy = box.y + box.height / 2;
        m.fx = m.cx;
        m.fy = m.cy;
        m.stemW = box.width * 0.03;
        m.stemH = box.height * 0.5;
        m.ry = 0;

        // The E's cell, and the stem inside it.
        const at = useWide ? WIDE_STEM : STACK_STEM;
        if (focusText && at >= 0) {
          try {
            const ext = focusText.getExtentOfChar(at);
            const style = getComputedStyle(focusText);
            const baseline = useWide ? 0 : STACK_LEAD;
            const stem = (probe && measureStem(probe, `${style.fontWeight} ${MEASURE_PX}px ${style.fontFamily}`)) ?? {
              left: ext.width * FALLBACK.left,
              right: ext.width * (FALLBACK.left + FALLBACK.width),
              cap: ext.height * FALLBACK.cap,
            };
            m.stemW = stem.right - stem.left - INSET * 2;
            m.stemH = stem.cap - INSET * 2;
            m.fx = ext.x + (stem.left + stem.right) / 2;
            m.fy = baseline - stem.cap * FOCUS_RISE;
            m.ry = baseline - stem.cap / 2 - m.fy;
          } catch {
            /* No text layout yet. The centre of the word is close enough. */
          }
        }

        // preserveAspectRatio="…meet" fits the viewBox, so one user unit is
        // k pixels.
        const rect = overlay.getBoundingClientRect();
        const k = Math.min(rect.width / vbW, rect.height / vbH) || 1;

        // What the screen shows, in user units: the fitted viewBox grown about
        // its centre until it is the shape of the overlay.
        const visW = rect.width / k;
        const visH = rect.height / k;
        m.vis = { x: m.cx - visW / 2, y: m.cy - visH / 2, w: visW, h: visH };

        // How far the stem has to grow before the rect covers the viewport,
        // once it has drifted to the middle: its half-width across, and the
        // nearer of its two ends (the baseline) up and down. A little over,
        // for the last of the drift.
        const reachX = m.stemW / 2;
        const reachY = Math.min(m.stemH / 2 - m.ry, m.stemH / 2 + m.ry);
        const need = Math.max(rect.width / 2 / (reachX * k), rect.height / 2 / (reachY * k));
        m.clearAt = need * 1.08;
        // The word fades over the last fifth before the swap, which should
        // begin once the rect covers the screen, but cannot outlast the glyph.
        m.swap = Math.min(SAFE_GLYPH_PX / (NOMINAL * k), m.clearAt / 0.8);
        m.max = Math.min(400, Math.max(8, m.swap, need * 1.18));

        applyWord();
      };

      layout();

      // The word is measured with whatever face is loaded; re-fit when the
      // display face swaps in, and whenever the stage is re-measured.
      let live = true;
      void document.fonts?.ready.then(() => {
        if (live) layout();
      });
      ScrollTrigger.addEventListener("refreshInit", layout);
      // refreshInit runs before ScrollTrigger releases the pin, so while the
      // section is pinned it measures the previous size. Measure again once
      // the refresh has re-pinned at the new one.
      ScrollTrigger.addEventListener("refresh", layout);

      const mm = gsap.matchMedia();

      mm.add(
        { desktop: `${MQ.motion} and ${MQ.desktop}`, mobile: `${MQ.motion} and ${MQ.mobile}` },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };

          gsap.set(filmRef.current, { force3D: true });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: desktop ? "+=230%" : "+=150%",
              scrub: 0.45,
              pin: stageRef.current,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // The copy clears out before the letters reach it.
          tl.to(
            [eyebrowRef.current, lineRef.current].filter(Boolean),
            { autoAlpha: 0, y: -14, duration: 0.16, stagger: 0.04, ease: "power2.in" },
            0.04,
          );

          // The letters open. One proxy value drives the transform, so
          // scrubbing back retraces exactly.
          tl.fromTo(
            view,
            { scale: 1 },
            {
              scale: () => m.max,
              duration: 0.64,
              ease: "power2.in",
              onUpdate: applyWord,
            },
            0.06,
          );

          // The picture pushes in a little the whole way.
          tl.fromTo(filmRef.current, { scale: 1.02 }, { scale: 1.14, duration: 0.92 }, 0);

          // The last slivers of ground go, leaving the picture full bleed.
          // autoAlpha: hidden, so nothing re-rasterises the mask on the hold.
          tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.6);

          // Hold, then fade to the page ground, so the white section below
          // arrives on continuous white instead of a cut.
          // Only in the last few per cent of the pin, so the page never sits on
          // a blank white screen: the ground fades up as the section is already
          // handing over to the metrics below.
          tl.to(coverRef.current, { opacity: 1, duration: 0.05, ease: "power1.in" }, 0.95);

          // Stop scrolling part-way through the opening and it finishes by
          // itself, in the direction you were going: on down to the full-bleed
          // hold, or back up to the wordmark. Scrolling still drives it frame
          // by frame; this only takes over once the page has come to rest, and
          // any new scroll input interrupts it.
          const HOLD = 0.74;
          const st = tl.scrollTrigger;
          let settling = false;
          const settle = () => {
            if (!st || settling || !st.isActive) return;
            const p = st.progress;
            if (p <= 0.015 || p >= HOLD - 0.01) return;
            const target = st.direction >= 0 ? st.start + (st.end - st.start) * HOLD : st.start;
            settling = true;
            // Released on a timer, not onComplete: if the visitor scrolls
            // during the glide, Lenis abandons it without calling back, and a
            // flag left set would switch this off for the rest of the visit.
            window.setTimeout(() => {
              settling = false;
            }, 1400);
            const lenis = getLenis();
            if (lenis) {
              lenis.scrollTo(target, { duration: 1.15, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
            } else {
              window.scrollTo({ top: target, behavior: "smooth" });
            }
          };
          ScrollTrigger.addEventListener("scrollEnd", settle);
          return () => ScrollTrigger.removeEventListener("scrollEnd", settle);
        },
      );

      return () => {
        live = false;
        ScrollTrigger.removeEventListener("refreshInit", layout);
        ScrollTrigger.removeEventListener("refresh", layout);
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <div ref={stageRef} className="zan-showreel-stage relative isolate w-full overflow-hidden bg-bg">
        {/* The picture, decorative. Ink until it has loaded, so the word is
            never white on white. The scroll scene scales this layer; the
            drift and the band of light move what is inside it (CSS). */}
        <div ref={filmRef} className="zan-showreel-film absolute inset-0 overflow-hidden bg-ink">
          <div className="zan-showreel-drift absolute -inset-[4%]">
            <Image
              src={still}
              alt=""
              fill
              sizes="110vw"
              className="object-cover object-[64%_72%] select-none"
              draggable={false}
            />
          </div>
          <div className="zan-showreel-glint absolute inset-y-0 -left-1/2 w-[200%]" />
        </div>

        {/* The sheet of page ground, with the wordmark knocked out of it. The
            two values inside the mask are luminance, not colour: opaque keeps
            the sheet, black cuts the hole. */}
        <svg ref={overlayRef} aria-hidden="true" focusable="false" className="absolute inset-0 size-full">
          <defs>
            <mask id={MASK_ID} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="rgb(255 255 255)" />
              <svg
                ref={innerRef}
                width="100%"
                height="100%"
                viewBox="-254 -118 508 170"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* The E's stem, laid under the word and grown with it. */}
                <rect ref={stemRef} x="0" y="0" width="0" height="0" fill="rgb(0 0 0)" />
                <g ref={wordRef}>
                  <text
                    ref={wideRef}
                    className="zan-showreel-word zan-showreel-word-wide"
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="rgb(0 0 0)"
                  >
                    {WIDE_WORD}
                  </text>
                  <g ref={stackRef} className="zan-showreel-word-stack">
                    <text className="zan-showreel-word" x="0" y="0" textAnchor="middle" fill="rgb(0 0 0)">
                      {STACK_TOP}
                    </text>
                    <text
                      ref={stackBottomRef}
                      className="zan-showreel-word"
                      x="0"
                      y={STACK_LEAD}
                      textAnchor="middle"
                      fill="rgb(0 0 0)"
                    >
                      {STACK_BOTTOM}
                    </text>
                  </g>
                </g>
              </svg>
            </mask>
          </defs>
          <rect ref={sheetRef} width="100%" height="100%" fill="var(--color-bg)" mask={`url(#${MASK_ID})`} />
        </svg>

        {/* Copy, on the ground above and below the wordmark. The layer lets
            the pointer through; the text takes it back so it can be selected. */}
        <div className="zan-showreel-copy pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between px-6 py-[clamp(5.5rem,12vh,8rem)] text-center">
          <div ref={eyebrowRef} className="pointer-events-auto">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          {line && (
            <p ref={lineRef} className="pointer-events-auto max-w-[38ch] text-balance text-lead text-ink-2">
              {line}
            </p>
          )}
        </div>

        {/* The fade to the page ground that hands off to the section below. */}
        <div ref={coverRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-bg opacity-0" />
      </div>
    </div>
  );
}

export default ShowreelStage;

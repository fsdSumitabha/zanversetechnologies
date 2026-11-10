"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { preloaderWords } from "@/constants/zan";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { getLenis } from "@/hooks/useLenis";
import { lockScroll } from "@/lib/scrollLock";
import { MQ } from "@/lib/gsap";
import { announcePreloaded, isAutomated, PRELOADER_SEEN_KEY } from "./shellStore";
import "./preloader.css";

/** Fallbacks, ms from mount, for a browser without getAnimations(). They
    match the delays of zan-pl-stage-out and zan-pl-gone in preloader.css. */
const REVEAL_MS = 1960;
const DONE_MS = 2550;

/**
 * The cover's own fallback, for a browser without getAnimations(): how long
 * after its first frame the cover stops waiting for this script and fades
 * out, and how long the fade takes. Copies of --zan-pl-fallback-at and
 * --zan-pl-fallback-fade in preloader.css, where the first also times the
 * header's failsafe, and which opening.css reads for the hero's: change them
 * together. With getAnimations() neither is used, because the fallback's own
 * animation says how far it has got.
 */
const FALLBACK_MS = 3000;
const FALLBACK_FADE_MS = 400;

/**
 * The performance mark the inline script in Preloader.tsx sets as the cover
 * is parsed, just before its first frame: where FALLBACK_MS counts from.
 * Spelled out in that script too.
 */
const COVER_MARK = "zan.preloader";

/**
 * How long <html> keeps [data-preloader-fallback] once the fallback's flag is
 * out (preloader.css). Longer than the header's own drop-in, a 0.2 s delay and
 * 0.7 s in Navbar.tsx, so its own styles have long caught up when the held
 * animation lets go.
 */
const HOLD_HEADER_MS = 1000;

/**
 * The cover's state, on <html>, for the rules outside the cover that depend on
 * it: the header's failsafe (preloader.css) and the homepage hero's
 * (opening.css). `PLAY_ATTR` is set with the cover's own [data-play], and
 * `FALLBACK_ATTR` while a late script finishes the fallback. On <html> rather
 * than read off the cover with html:has(#zan-preloader...), because a :has()
 * on <html> has Chrome check it again on every insertion anywhere in the page:
 * measured on the homepage, about 300 extra checks and a fifth more style work.
 */
const PLAY_ATTR = "data-preloader-play";
const FALLBACK_ATTR = "data-preloader-fallback";

/**
 * The shutter: SLATS navy slats side by side, each one its own slice of a
 * single gradient. The gradient is laid out twice the screen's width, as
 * .bg-action-gradient lays it out on one box, and every slat shows the part
 * that lies behind where it stands, so with all of them up there is one
 * continuous panel and no seam. A pixel of overlap on either side covers the
 * hairline a fractional width would otherwise leave between two moving
 * layers. --zan-pl-i staggers their animation (preloader.css).
 */
const SLATS = 5;
const SLAT_STYLES = Array.from(
  { length: SLATS },
  (_, i) =>
    ({
      "--zan-pl-i": i,
      left: `calc(${(i * 100) / SLATS}% - 1px)`,
      width: `calc(${100 / SLATS}% + 2px)`,
      backgroundSize: `${SLATS * 200}% 100%`,
      backgroundPosition: `${(i / (SLATS * 2 - 1)) * 100}% 0`,
    }) as CSSProperties,
);

function cssAnimation(el: Element, name: string): Animation | undefined {
  return el.getAnimations?.().find((a) => (a as CSSAnimation).animationName === name);
}

/**
 * Calls `fn` when the named CSS animation on `el` ends — at once if it
 * already has. If the animation is not there yet (the stylesheet can land
 * after hydration in dev), it looks again for a couple of seconds before
 * falling back to a timer; it never treats "not found" as "finished", which
 * would drop the preloader before it had played.
 */
function whenAnimationEnds(el: Element, name: string, fallbackMs: number, fn: () => void): () => void {
  let live = true;
  let timer = 0;
  let tries = 0;
  const done = () => {
    if (live) fn();
  };
  const attach = () => {
    if (!live) return;
    const anim = typeof el.getAnimations === "function" ? cssAnimation(el, name) : undefined;
    if (anim) {
      if (anim.playState === "finished") done();
      else anim.finished.then(done, done);
      return;
    }
    if (typeof el.getAnimations !== "function" || ++tries > 40) {
      timer = window.setTimeout(done, fallbackMs);
      return;
    }
    timer = window.setTimeout(attach, 50);
  };
  attach();
  return () => {
    live = false;
    window.clearTimeout(timer);
  };
}

/** When the cover was parsed, in ms since the page started to load. 0 if the
    mark is missing, which can only make the fallback look sooner than it is,
    so it can stop a replay but never cause one. */
function coverParsedAt(): number {
  try {
    return performance.getEntriesByName(COVER_MARK, "mark")[0]?.startTime ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Whether the cover's own fallback (preloader.css) has begun: this script came
 * too late, the cover is already uncovering the page by itself, and the
 * sequence must not start over it. The fallback's fade says so once it is
 * past its delay. No such animation means the stylesheet has not landed yet
 * (dev), so nothing has begun. Without getAnimations(), the clock from the
 * inline script's mark decides.
 */
function fallbackBegun(root: HTMLElement): boolean {
  if (typeof root.getAnimations !== "function") {
    return performance.now() - coverParsedAt() >= FALLBACK_MS;
  }
  const fade = cssAnimation(root, "zan-pl-fallback-fade");
  if (!fade) return false;
  if (fade.playState === "finished") return true;
  const t = fade.currentTime;
  return typeof t === "number" && t >= (fade.effect?.getTiming().delay ?? FALLBACK_MS);
}

/** Ms until the fallback has finished, for a browser without getAnimations(). */
function fallbackLeftMs(): number {
  return Math.max(0, coverParsedAt() + FALLBACK_MS + FALLBACK_FADE_MS - performance.now());
}

/**
 * The homepage hero's entrance (components/zan/opening/opening.css) starts on
 * html[data-preloaded]. After the fallback the hero is already on screen, so
 * the flag must not start it again: an inline animation:none outranks those
 * rules. Only for the elements on the page now. A hero mounted later, on a
 * visit back to the homepage, enters as it always does.
 */
function settleHeroEntrance() {
  document.querySelectorAll<HTMLElement>(".zan-hero-in, .zan-hero-word").forEach((el) => {
    el.style.animation = "none";
  });
}

/**
 * The Zan Verse Technologies lockup, the three practices rising out of their
 * masks one after another, a brand hairline filling underneath — then five
 * navy slats rise over it all, left to right, meet as one panel and carry on
 * up and away in the same order, uncovering the page: the reference's black
 * page reveal, cut into a shutter, in the brand's navy.
 *
 * The sequence is CSS (preloader.css). Until it starts, the stage holds the
 * first paint statically. This component starts it once a frame has been
 * painted, holds the page still while it is covered, and announces
 * `zan:preloaded` the moment the stage drops out.
 *
 * Unless this script is late. The cover waits FALLBACK_MS for it and then
 * fades out by itself (preloader.css). If that fallback has begun when this
 * runs, at mount or two frames later just before the start, the sequence is
 * never played over the page and the page is never locked. The fallback
 * finishes as it is, the cover goes, and the flag goes out with the hero's
 * entrance settled and the header held, so nothing on screen plays twice.
 */
export function PreloaderStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(PRELOADER_SEEN_KEY) === "1";
    } catch {
      /* storage blocked: play it */
    }
    // An automated browser skips it too, as SKIP_SCRIPT in Preloader.tsx does,
    // so that agents are not blocked. People get the same sequence as ever.
    if (seen || isAutomated() || window.matchMedia(MQ.reduce).matches) {
      root.style.display = "none";
      announcePreloaded();
      return;
    }

    const markSeen = () => {
      try {
        sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
      } catch {
        /* storage blocked */
      }
    };

    let releaseScroll: (() => void) | null = null;
    const unlock = () => {
      releaseScroll?.();
      releaseScroll = null;
    };
    let offReveal = () => {};
    let offDone = () => {};
    let stopLenis = 0;
    let firstFrame = 0;
    let secondFrame = 0;
    // True once the fallback's flag is out. From then on the header's hold
    // lets go on its own timer, which a cleanup must not cut short.
    let settled = false;

    // Too late for the sequence: the cover has started to leave by itself.
    // Nothing is started and nothing is locked, and the fallback finishes as
    // it is. Then the cover goes and the flag goes out, with nothing on screen
    // playing again: the hero's entrance is settled first, and
    // [data-preloader-fallback] holds the header's failsafe animation through
    // the flag until React has redrawn the header with its own entered styles
    // (preloader.css). The seen flag is set at the end, as the sequence sets
    // it at its end.
    const html = document.documentElement;
    const finishQuietly = () => {
      unlock();
      html.setAttribute(FALLBACK_ATTR, "");
      offDone = whenAnimationEnds(root, "zan-pl-fallback-gone", fallbackLeftMs(), () => {
        root.style.display = "none";
        markSeen();
        settleHeroEntrance();
        settled = true;
        announcePreloaded();
        window.setTimeout(() => {
          html.removeAttribute(FALLBACK_ATTR);
        }, HOLD_HEADER_MS);
      });
    };

    const play = () => {
      // In one task, so the cover and the rules outside it switch in one style pass.
      root.dataset.play = "1";
      html.setAttribute(PLAY_ATTR, "");
      offReveal = whenAnimationEnds(stage, "zan-pl-stage-out", REVEAL_MS, () => {
        unlock();
        announcePreloaded();
      });
      offDone = whenAnimationEnds(root, "zan-pl-gone", DONE_MS, () => {
        root.style.display = "none";
        markSeen();
      });
    };

    if (fallbackBegun(root)) {
      finishQuietly();
    } else {
      // Hold the page still while it is covered: overflow hidden on <html>, as
      // it always was, but through the counted lock the overlays use
      // (lib/scrollLock.ts), so an overlay opened under the cover keeps the
      // page locked until it closes. Lenis is created in a sibling effect that
      // runs after this one, so reach for it a frame later.
      //
      // The page behind is not made inert. The cover is aria-hidden, so a
      // screen reader has the page at once, and a keyboard's first Tab still
      // reaches the skip link, which shows above the cover.
      releaseScroll = lockScroll({ body: false });
      stopLenis = requestAnimationFrame(() => {
        if (releaseScroll) getLenis()?.stop();
      });

      // Play once a frame has really been painted: the second rAF runs after
      // the first frame is on screen. Starting the clock any earlier spends
      // the sequence while nothing is visible — on a busy load, first paint
      // can trail hydration by well over a second. The fallback is checked
      // again here, because two frames on a busy main thread can carry the
      // start past its moment; the lock then comes off unused.
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (fallbackBegun(root)) finishQuietly();
          else play();
        });
      });
    }

    return () => {
      cancelAnimationFrame(stopLenis);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      offReveal();
      offDone();
      delete root.dataset.play;
      html.removeAttribute(PLAY_ATTR);
      if (!settled) html.removeAttribute(FALLBACK_ATTR);
      unlock();
    };
  }, []);

  return (
    <div
      id="zan-preloader"
      ref={rootRef}
      aria-hidden="true"
      className="zan-pl-root pointer-events-none fixed inset-0 z-[200] overflow-hidden"
    >
      <div
        ref={stageRef}
        className="zan-pl-stage pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-canvas px-6"
      >
        <ZanLogo eager className="h-10 sm:h-12" />

        <p className="mt-8 flex flex-col items-center gap-y-1.5 text-center font-display text-[clamp(1.375rem,0.9rem+1.6vw,2.25rem)] leading-[1.15] font-medium text-foreground lg:flex-row lg:gap-x-6">
          {preloaderWords.map((word, i) => {
            const index = { "--zan-pl-i": i } as CSSProperties;
            return (
              <Fragment key={word}>
                {i > 0 && (
                  <span className="zan-pl-dot hidden size-1.5 shrink-0 rounded-full bg-accent lg:block" style={index} />
                )}
                <span className="block overflow-hidden pb-[0.14em]">
                  <span className="zan-pl-word whitespace-nowrap" style={index}>
                    {word}
                  </span>
                </span>
              </Fragment>
            );
          })}
        </p>

        <div className="absolute bottom-[max(12vh,4rem)] left-1/2 h-px w-[min(16rem,56vw)] -translate-x-1/2 overflow-hidden bg-border">
          <span className="zan-pl-bar block h-full bg-accent-gradient" />
        </div>
      </div>

      {SLAT_STYLES.map((style, i) => (
        <div key={i} className="zan-pl-slat absolute inset-y-0 bg-action-gradient" style={style} />
      ))}
    </div>
  );
}

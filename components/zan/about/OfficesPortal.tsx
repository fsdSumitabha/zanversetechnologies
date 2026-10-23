"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { about, office } from "@/constants/zan";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { cn } from "@/lib/utils";
import { useLocalTime } from "./useLocalTime";
import "./about.css";

/* ───────────────────────────────────────────────────────────────────────────
   THE OFFICE — the zoom collage's centre frame, and the page it opens onto.

   Laid out at full-screen size: ZoomParallax shrinks it into the frame and
   the zoom brings it back to 1:1, so it is composed as a page, not a card.
   The city is set huge, with the country under it, the address and the
   number at the foot, and the office's own clock beside it: a station-clock
   face whose minute hand jumps on the minute and whose gold seconds hand
   sweeps round, trailing a wedge of light. The same time is in figures, in a
   <time> element, which is what assistive tech reads; the face is decorative.

   One set of elements, two layouts (grid areas in about.css): a column on
   phones and in the reduced-motion collage, where this is the lead card, and
   city left, clock right from a 48rem container up.

   Only true things: the city, country, address, number and time zone come
   from `office`, and the time is the visitor's own clock read in Asia/Dubai.
   No opening hours and no "open now": the site has never published either.
   ─────────────────────────────────────────────────────────────────────────── */

/** The face's sixty ticks; every fifth is an hour mark. */
const TICKS = Array.from({ length: 60 }, (_, i) => i);

const angle = (deg: number) => ({ "--a": `${deg}deg` }) as CSSProperties;

function Dial({ time }: { time: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [h, m] = time.split(":").map(Number);
  // "--:--" until the client clock is known: the hands wait, hidden.
  const ready = Number.isFinite(h) && Number.isFinite(m);

  // The seconds hand and its light are a CSS sweep. This only says where in
  // its minute the sweep starts (local seconds are UTC seconds in every zone,
  // so no zone is needed), pauses it off screen, and puts it right again when
  // the face or the tab comes back.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const sync = () => el.style.setProperty("--zan-sweep", `${-(Date.now() % 60_000) / 1000}s`);
    const io = new IntersectionObserver((entries) => {
      // The last record is the current state; several can queue at once.
      const on = entries[entries.length - 1].isIntersecting;
      if (on) sync();
      el.toggleAttribute("data-paused", !on);
    });
    sync();
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="zan-clock" data-ready={ready || undefined}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible">
        <circle cx="100" cy="100" r="99" className="fill-bg stroke-line-strong" strokeWidth="1" />
        {TICKS.map((i) => {
          const hour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1="8"
              x2="100"
              y2={hour ? 24 : 14}
              transform={`rotate(${i * 6} 100 100)`}
              className={hour ? "stroke-ink" : "stroke-line-strong"}
              strokeWidth={hour ? 3 : 1.25}
            />
          );
        })}
      </svg>
      <span className="zan-clock-arm zan-clock-trail" />
      <span className="zan-clock-arm zan-clock-hour" style={angle(ready ? ((h % 12) + m / 60) * 30 : 0)}>
        <i />
      </span>
      <span className="zan-clock-arm zan-clock-minute" style={angle(ready ? m * 6 : 0)}>
        <i />
      </span>
      <span className="zan-clock-arm zan-clock-seconds">
        <i />
        <b />
      </span>
      <span className="zan-clock-cap" />
    </div>
  );
}

const label = "font-mono text-eyebrow text-muted uppercase";

/**
 * The Dubai office as a full-screen page, for the About collage's centre
 * frame. Exported under its old name, which About.tsx and the zoom collage
 * know it by.
 */
export function OfficesPortal() {
  const { time, offset, iso } = useLocalTime(office.timeZone);

  return (
    <div className="@container h-full">
      <div className="zan-office h-full bg-brand-wash px-[5.5cqw] pt-[var(--zan-portal-top,2.25rem)] pb-[5svh]">
        <div className="[grid-area:eyebrow]">
          <Eyebrow>{about.principles[1].label}</Eyebrow>
        </div>

        <div className="[grid-area:city]">
          <h3 className="font-display text-[min(24cqw,17svh)] leading-[0.86] font-semibold tracking-[-0.045em] text-ink @3xl:text-[min(18cqw,28svh)]">
            {office.city}
          </h3>
          <p className="mt-[1.8svh] text-[clamp(1rem,4.6cqw,1.5rem)] tracking-[-0.01em] text-ink-2 @3xl:text-[clamp(1.125rem,2cqw,1.875rem)]">
            {office.country}
          </p>
        </div>

        <div className="zan-office-dial [grid-area:dial]">
          <Dial time={time} />
        </div>

        <div className="zan-office-fact zan-office-time [grid-area:time]">
          <p className={label}>Local time</p>
          <time
            dateTime={iso}
            className="mt-[1.4svh] block font-mono text-[min(11cqw,6.4svh)] leading-none font-medium tracking-[-0.04em] text-ink tabular-nums @3xl:text-[min(4.8cqw,8svh)]"
          >
            {time}
          </time>
          {/* Empty until the client clock is known, like the time itself. */}
          <p className={cn(label, "mt-[1.2svh] min-h-[1em]")}>{offset}</p>
        </div>

        <div className="zan-office-fact [grid-area:address]">
          <p className={label}>Address</p>
          <address className="mt-[1.4svh] text-small text-ink-2 not-italic @3xl:text-[clamp(0.9375rem,1.25cqw,1.125rem)] @3xl:leading-relaxed">
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {/* Words never break inside, so a narrow column wraps at a
                    space and "91117-001" is never split at its hyphen. */}
                {line.split(" ").map((word, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="whitespace-nowrap">{word}</span>
                  </Fragment>
                ))}
              </span>
            ))}
          </address>
        </div>

        <div className="zan-office-fact [grid-area:phone]">
          <p className={label}>Phone</p>
          <a
            href={`tel:${office.phoneTel}`}
            className="mt-[1.4svh] inline-block text-small font-medium text-ink tabular-nums underline-offset-4 hover:underline @3xl:text-[clamp(0.9375rem,1.25cqw,1.125rem)]"
          >
            {office.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}

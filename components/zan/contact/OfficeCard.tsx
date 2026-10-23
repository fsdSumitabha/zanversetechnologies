"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEventHandler, type ReactNode } from "react";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { office, site } from "@/constants/zan";
import { trackWhatsAppClick } from "@/lib/analytics";
import { MQ } from "@/lib/gsap";
import { waLink } from "@/lib/links";
import { cn } from "@/lib/utils";
import { useLocalTime } from "@/components/zan/about/useLocalTime";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import "./OfficeCard.css";

/* ───────────────────────────────────────────────────────────────────────────
   THE OFFICE CARD

   The company has one office, so this is one card, built to be the whole
   answer to "where are you, and how do I reach you": the address, a tap to
   call, WhatsApp, directions, and the time it is in Dubai right now.

   It sits beside the enquiry form (the homepage's contact section and
   /contact-us), where it sticks while the form is filled in, and in the
   office band of /about-us.

   Motion, all of it optional:
     · the reference profile card's pointer tilt, glare and sheen, where a fine
       pointer can drive it and motion is welcome (attachTilt below);
     · a band across the top read as a map: a dotted field drifting under
       contour rings, and a beacon pinging where the office is;
     · a dial showing Dubai time. Its hands sweep round from twelve the first
       time the card is seen, and a second hand runs in step with the real
       seconds, so the minute hand ticks over just as it passes twelve.
   With reduced motion the band and the dial are still drawn but stand still,
   and the dial has no second hand. The digital time at the foot of the card
   is the readout assistive technology gets; the band and the dial are
   aria-hidden.
   ─────────────────────────────────────────────────────────────────────────── */

/** Tilt only where a fine pointer can drive it and motion is welcome. */
const TILT_QUERY = `${MQ.fine} and ${MQ.motion}`;

const MAX_TILT_X = 6; // deg, top/bottom
const MAX_TILT_Y = 7; // deg, left/right
const TAU = 0.14; // s — how quickly the card catches the pointer
const TAU_INTRO = 0.6; // s — the slower settle when it first scrolls in
const INTRO_MS = 1200;

const VARS = [
  "--zan-oc-px",
  "--zan-oc-py",
  "--zan-oc-bx",
  "--zan-oc-by",
  "--zan-oc-fl",
  "--zan-oc-ft",
  "--zan-oc-tilt-x",
  "--zan-oc-tilt-y",
] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

/** A Google Maps search for the address exactly as the card prints it. */
const DIRECTIONS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [...office.addressLines, office.city, office.country].join(", "),
)}`;

/**
 * ProfileCard's tilt engine: the pointer sets a target, a rAF loop eases the
 * current position toward it (exponential smoothing), and the position is
 * written as CSS variables that OfficeCard.css turns into rotation, glare,
 * sheen, shadow, a small content parallax and the drift of the map band. The
 * loop stops once settled.
 */
function attachTilt(wrap: HTMLElement, card: HTMLElement): () => void {
  let raf = 0;
  let last = 0;
  let cx = 0;
  let cy = 0;
  let tx = 0;
  let ty = 0;
  let slowUntil = 0;
  let hovering = false;
  let enterTimer = 0;

  const write = (x: number, y: number) => {
    const w = card.clientWidth || 1;
    const h = card.clientHeight || 1;
    const px = clamp((x / w) * 100, 0, 100);
    const py = clamp((y / h) * 100, 0, 100);
    const s = wrap.style;
    s.setProperty("--zan-oc-px", `${px.toFixed(2)}%`);
    s.setProperty("--zan-oc-py", `${py.toFixed(2)}%`);
    s.setProperty("--zan-oc-bx", `${(35 + px * 0.3).toFixed(2)}%`);
    s.setProperty("--zan-oc-by", `${(35 + py * 0.3).toFixed(2)}%`);
    s.setProperty("--zan-oc-fl", (px / 100).toFixed(3));
    s.setProperty("--zan-oc-ft", (py / 100).toFixed(3));
    s.setProperty("--zan-oc-tilt-x", `${(((py - 50) / 50) * MAX_TILT_X).toFixed(2)}deg`);
    s.setProperty("--zan-oc-tilt-y", `${((-(px - 50) / 50) * MAX_TILT_Y).toFixed(2)}deg`);
  };

  const step = (ts: number) => {
    const dt = last ? (ts - last) / 1000 : 1 / 60;
    last = ts;
    const k = 1 - Math.exp(-dt / (ts < slowUntil ? TAU_INTRO : TAU));
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    write(cx, cy);
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
      last = 0;
      if (!hovering) wrap.classList.remove("is-active");
    }
  };

  const start = () => {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(step);
  };

  const toCentre = () => {
    tx = card.clientWidth / 2;
    ty = card.clientHeight / 2;
    start();
  };

  const aim = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
  };

  const onEnter = (e: PointerEvent) => {
    hovering = true;
    wrap.classList.add("is-active", "is-entering");
    window.clearTimeout(enterTimer);
    enterTimer = window.setTimeout(() => wrap.classList.remove("is-entering"), 180);
    aim(e);
    start();
  };
  const onMove = (e: PointerEvent) => {
    aim(e);
    start();
  };
  const onLeave = () => {
    hovering = false;
    toCentre();
  };

  card.addEventListener("pointerenter", onEnter);
  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);

  // The reference's entrance: the first time the card scrolls in, the light
  // starts at the top-right corner and drifts to rest.
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      if (hovering) return;
      cx = card.clientWidth - 60;
      cy = 40;
      write(cx, cy);
      wrap.classList.add("is-active");
      slowUntil = performance.now() + INTRO_MS;
      toCentre();
    },
    { threshold: 0.5 },
  );
  io.observe(card);

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(enterTimer);
    io.disconnect();
    card.removeEventListener("pointerenter", onEnter);
    card.removeEventListener("pointermove", onMove);
    card.removeEventListener("pointerleave", onLeave);
    wrap.classList.remove("is-active", "is-entering");
    for (const v of VARS) wrap.style.removeProperty(v);
  };
}

/* ── The dial ────────────────────────────────────────────────────────────── */

/** The hour and minute hands for "14:05", in degrees; null for "--:--". */
function handAngles(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return { hour: (hours % 12) * 30 + minutes / 2, minute: minutes * 6 };
}

/**
 * Starts the second hand where the real second hand is. A ref callback, so it
 * runs as the hand is attached and before it is first painted. The hand is
 * keyed on the minute, so it is attached afresh every minute and any drift (a
 * throttled tab, a laptop that slept) is corrected once a minute.
 */
function syncSecondHand(hand: HTMLSpanElement | null) {
  if (hand) hand.style.animationDelay = `${-(Date.now() % 60_000) / 1000}s`;
}

const angle = (deg: number) => ({ "--zan-oc-angle": `${deg}deg` }) as CSSProperties;

const TICKS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Dubai time as a face. The hands are only put on once the card has been
 * seen, which is what lets them sweep round from twelve in front of the
 * visitor rather than off-screen during hydration.
 */
function Dial({ time, seen }: { time: string; seen: boolean }) {
  const hands = seen ? handAngles(time) : null;
  return (
    <div aria-hidden="true" className="zan-oc-dial size-18 sm:size-20">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {TICKS.map((i) => (
          <line
            key={i}
            x1="50"
            x2="50"
            y1={i % 3 === 0 ? 8 : 10}
            y2={i % 3 === 0 ? 17 : 14}
            transform={`rotate(${i * 30} 50 50)`}
            className={i % 3 === 0 ? "zan-oc-tick-major" : "zan-oc-tick"}
          />
        ))}
      </svg>
      {hands && (
        <>
          <span className="zan-oc-hand zan-oc-hand-hour" style={angle(hands.hour)} />
          <span className="zan-oc-hand zan-oc-hand-minute" style={angle(hands.minute)} />
          <span key={time} ref={syncSecondHand} className="zan-oc-hand zan-oc-hand-second" />
        </>
      )}
      <span className="zan-oc-pivot" />
    </div>
  );
}

/* ── The ways in ─────────────────────────────────────────────────────────── */

/**
 * One way to reach the office. The whole row is the link, so the target is
 * the full width of the card and never less than 56px tall.
 */
function Way({
  href,
  label,
  icon,
  external = false,
  analyticsLabel,
  onClick,
  children,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  /** What ContactClicks reports for a tel: link, instead of the row's text. */
  analyticsLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        data-analytics-label={analyticsLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group/way flex min-h-14 items-center gap-3.5 py-2.5"
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-bg transition-[background-color,border-color] duration-300 group-hover/way:border-brand group-hover/way:bg-brand-soft"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">{label}</span>
          <span className="mt-0.5 block truncate text-body font-medium text-ink transition-colors duration-300 group-hover/way:text-brand-ink">
            {children}
          </span>
        </span>
        {external && (
          <>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted transition-[translate,color] duration-300 ease-out-expo group-hover/way:translate-x-0.5 group-hover/way:-translate-y-0.5 group-hover/way:text-brand-ink"
              strokeWidth={2}
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        )}
      </a>
    </li>
  );
}

/* ── The card ────────────────────────────────────────────────────────────── */

function OfficeCard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const { time, offset, iso } = useLocalTime(office.timeZone);
  /** The card has been on screen: the dial's hands go on. */
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const mq = window.matchMedia(TILT_QUERY);
    let detach: (() => void) | undefined;
    const sync = () => {
      detach?.();
      detach = mq.matches ? attachTilt(wrap, card) : undefined;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      detach?.();
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setSeen(true);
      },
      { threshold: 0.35 },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  const wayIcon = "size-4 shrink-0";

  return (
    <div ref={wrapRef} className="zan-office">
      <article
        ref={cardRef}
        aria-labelledby={titleId}
        className="zan-office-card overflow-hidden rounded-3xl border border-line"
      >
        {/* Before the sheen and the glare, so the light passes over it. */}
        <div aria-hidden="true" className="zan-oc-map h-24 sm:h-28">
          <div className="zan-oc-field">
            <div className="zan-oc-dots" />
          </div>
          <span className="zan-oc-beacon" />
        </div>
        <div className="zan-office-sheen" aria-hidden="true" />
        <div className="zan-office-glare" aria-hidden="true" />

        <div className="zan-office-content px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pt-6">
              <p className="truncate font-mono text-eyebrow text-muted uppercase">{office.country}</p>
              <h3 id={titleId} className="mt-3 font-display text-h2 text-ink">
                {office.city}
              </h3>
            </div>
            {/* Half over the band, half over the card. */}
            <div className="-mt-9 shrink-0 sm:-mt-10">
              <Dial time={time} seen={seen} />
            </div>
          </div>

          <address className="mt-4 text-small text-ink-2 not-italic">
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">{office.city}</span>
          </address>

          <ul className="mt-6 divide-y divide-line border-y border-line">
            <Way
              href={`tel:${office.phoneTel}`}
              label="Call"
              analyticsLabel={office.phoneDisplay}
              icon={<Phone aria-hidden="true" className={cn(wayIcon, "text-brand-ink")} strokeWidth={1.8} />}
            >
              <span className="tabular-nums">{office.phoneDisplay}</span>
            </Way>
            <Way
              href={WHATSAPP_HREF}
              label="WhatsApp"
              external
              onClick={() => trackWhatsAppClick("Office Card WhatsApp")}
              icon={<SocialIcon name="WhatsApp" className={cn(wayIcon, "text-whatsapp")} />}
            >
              Message us
            </Way>
            <Way
              href={DIRECTIONS_HREF}
              label="Directions"
              external
              icon={<MapPin aria-hidden="true" className={cn(wayIcon, "text-brand-ink")} strokeWidth={1.8} />}
            >
              Open in Google Maps
            </Way>
          </ul>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">Local time</p>
            <p className="flex items-baseline gap-2">
              <time dateTime={iso} className="font-mono text-h3 text-ink tabular-nums">
                {time}
              </time>
              {offset && <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-muted">{offset}</span>}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

/**
 * The Dubai office card, as the contact section, /contact-us and /about-us
 * place it. `className` positions it; the card sizes itself to its column.
 */
export function OfficeCards({ className }: { className?: string }) {
  return (
    <div className={className}>
      <OfficeCard />
    </div>
  );
}

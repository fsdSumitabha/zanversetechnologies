"use client";

import { useEffect, useId, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue, type Variants } from "framer-motion";
import { ArrowUp, Mail, Phone, ShieldCheck } from "lucide-react";
import {
  contactIntro,
  credentials,
  ctas,
  footerColumns,
  legalLinks,
  office,
  site,
  socialLinks,
} from "@/constants/zan";
import { useLocalTime } from "@/components/zan/about/useLocalTime";
import { ButtonLink } from "@/components/zan/ui/Button";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { trackWhatsAppClick } from "@/lib/analytics";
import { openConsentSettings } from "@/lib/consent";
import { MQ } from "@/lib/gsap";
import { waLink } from "@/lib/links";
import { useSiteHref } from "@/lib/useSiteHref";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "./shellStore";
import { SocialIcon } from "./SocialIcon";

/** Module scope, so render stays pure. suppressHydrationWarning covers the
 *  one night a year the server and the browser disagree. */
const YEAR = new Date().getFullYear();

/** The contact lead's first sentence as the line, the rest beneath it. */
const [CTA_LINE, ...CTA_REST] = contactIntro.lead.split(/(?<=\.)\s+/);

const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── The wordmark ──────────────────────────────────────────────────────────
   "ZAN VERSE", one letter at a time. Each letter has its own slice of the
   footer's arrival: the first starts rising as the wordmark comes into range,
   each next one STEP later, and every slice is the same length, so the last
   lands exactly as the page ends. They come up from below the mask tipped a
   few degrees, alternately left and right, and straighten as they settle. */

const LETTERS = Array.from(`${site.wordmark.lead} ${site.wordmark.trail}`);
const STEP = 0.05;
const SLICE = 1 - STEP * (LETTERS.length - 1);
const TILT = 9; // deg

function WordmarkLetter({
  char,
  index,
  progress,
  still,
}: {
  char: string;
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const start = index * STEP;
  const y = useTransform(progress, [start, start + SLICE], ["105%", "0%"]);
  const rotate = useTransform(progress, [start, start + SLICE], [index % 2 ? TILT : -TILT, 0]);
  if (char === " ") return " ";
  return (
    <motion.span
      // Each letter carries its own copy of the ghosted fill: a transformed
      // child is painted on a layer of its own, which a parent's
      // background-clip: text does not reach, so a gradient on the line
      // would leave the letters invisible.
      className="inline-block origin-bottom bg-linear-to-b from-ink/[0.085] to-ink/[0.025] bg-clip-text pt-[0.02em] pb-[0.1em] text-transparent"
      // Reduced motion: explicitly at rest. Without JavaScript the server's
      // starting position would hold, so data-reveal lets layout.tsx's
      // noscript rule set the letters down.
      style={still ? { y: 0, rotate: 0 } : { y, rotate }}
      data-reveal
    >
      {char}
    </motion.span>
  );
}

/* ── The Dubai clock ───────────────────────────────────────────────────────
   The office's wall-clock time from the shared minute clock, as digits and on
   a small face. The server knows no time, so the hands start at twelve and
   wind round to the real time once the browser has it; after that each minute
   moves them on. They only ever turn clockwise: an angle is carried on past
   360 rather than wrapped back to 0, which would spin the hand backwards at
   the top of every hour. */

function useHand(degrees: number | null, still: boolean): MotionValue<number> {
  const angle = useMotionValue(0);
  useEffect(() => {
    if (degrees === null) return;
    const current = angle.get();
    let next = degrees;
    while (next < current - 0.5) next += 360;
    if (still) {
      angle.set(next);
      return;
    }
    const controls = animate(angle, next, { duration: 1.2, ease: EASE });
    return () => controls.stop();
  }, [angle, degrees, still]);
  return angle;
}

const TICKS = Array.from({ length: 12 }, (_, i) => i);

function OfficeClock({ timeZone, still }: { timeZone: string; still: boolean }) {
  const { time, offset, iso } = useLocalTime(timeZone);
  const [h, m] = time.split(":").map(Number);
  const known = Number.isFinite(h) && Number.isFinite(m);
  const hour = useHand(known ? (h % 12) * 30 + m * 0.5 : null, still);
  const minute = useHand(known ? m * 6 : null, still);

  return (
    <p className="mt-6 flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className="relative block size-10 shrink-0 rounded-full border border-line-strong bg-bg shadow-lift"
      >
        {TICKS.map((i) => (
          <span key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <span
              className={cn(
                "absolute top-[3px] left-1/2 w-px -translate-x-1/2 rounded-full",
                i % 3 === 0 ? "h-1.5 bg-muted" : "h-1 bg-line-strong",
              )}
            />
          </span>
        ))}
        <motion.span
          className="absolute bottom-1/2 left-1/2 -ml-px h-[28%] w-0.5 origin-bottom rounded-full bg-ink"
          style={{ rotate: hour }}
        />
        <motion.span
          className="absolute bottom-1/2 left-1/2 -ml-[0.75px] h-[38%] w-[1.5px] origin-bottom rounded-full bg-brand-ink"
          style={{ rotate: minute }}
        />
        <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </span>
      <span className="flex flex-col">
        <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
          Local time in {office.city}
        </span>
        <span className="mt-1 flex items-baseline gap-2">
          <time dateTime={iso} className="font-mono text-h3 text-ink tabular-nums">
            {time}
          </time>
          {offset && <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-muted">{offset}</span>}
        </span>
      </span>
    </p>
  );
}

/* The city name rises out of its mask as the band comes into view. The
   trigger sits on the heading, which is never clipped; a span watching
   itself from under an overflow-hidden mask would never intersect. */
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;
const rise: Variants = {
  hidden: { y: "108%" },
  visible: { y: "0%", transition: { duration: 1.1, ease: EASE } },
};

/** Contact rows in the office band: a round glyph that fills with gold on hover, then the value. */
const contactRow =
  "group/contact inline-flex min-h-11 items-center gap-3 text-body text-ink md:min-h-0 transition-colors duration-300 hover:text-brand-ink";
const contactGlyph =
  "grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface transition-colors duration-300 group-hover/contact:border-brand group-hover/contact:bg-brand group-hover/contact:text-on-brand";

/**
 * The page's close: a CTA strip; the brand column (logo, tagline, socials and
 * the two ISO certifications) beside the link columns (pages of this site);
 * the Dubai office as one band of its own (where it is, its local time, and
 * every way to reach it); the legal bar; and a giant ghosted "ZAN VERSE" whose
 * letters rise one after another as the page ends. Third-party credits live
 * on /disclaimer, not here.
 */
export function Footer() {
  const href = useSiteHref();
  const officeId = useId();
  const markRef = useRef<HTMLDivElement>(null);
  // A media-query store rather than framer's useReducedMotion: that one
  // already answers during hydration, so server and client would disagree.
  const reduce = useMediaQuery(MQ.reduce);
  const progress = useMotionValue(0);

  // The wordmark rises over the last stretch of the page, measured from its
  // own box on every scroll, so pins that grow the page after load cannot
  // leave the range stale.
  useEffect(() => {
    const el = markRef.current;
    if (reduce || !el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const lead = vh * 0.35;
      progress.set(Math.min(1, Math.max(0, (vh + lead - r.top) / (lead + r.height))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce, progress]);

  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-surface-2 text-ink">
      {/* ── CTA strip ─────────────────────────────────────────────────── */}
      <div className="container-zan pt-16 sm:pt-20">
        <div className="flex flex-col gap-8 rounded-3xl border border-line bg-bg px-6 py-8 shadow-lift sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>{contactIntro.eyebrow}</Eyebrow>
            <p className="mt-4 font-display text-h2 text-ink">{CTA_LINE}</p>
            {CTA_REST.length > 0 && <p className="mt-3 text-body text-ink-2">{CTA_REST.join(" ")}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            <ButtonLink href={href(ctas.project.href)} size="lg">
              {ctas.project.label}
            </ButtonLink>
            <ButtonLink
              href={`mailto:${site.email}`}
              variant="secondary"
              size="lg"
              arrow={false}
              icon={<Mail aria-hidden="true" className="size-4 shrink-0 text-brand-ink" />}
            >
              {site.email}
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Brand + link columns ───────────────────────────────────────── */}
      <div className="container-zan grid gap-12 pt-16 pb-12 sm:pt-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <SiteLink href="#main" aria-label={`${site.name} home`} className="inline-flex rounded-lg">
            <ZanLogo className="h-9" />
          </SiteLink>
          <p className="mt-5 max-w-sm text-lead text-ink-2">{site.tagline}</p>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className="group/social inline-flex h-11 items-center md:h-10 gap-2 rounded-full border border-line bg-bg pr-4 pl-1.5 text-small font-medium text-ink-2 transition-[color,border-color,translate] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-line-strong hover:text-ink"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-surface text-ink transition-colors duration-300 group-hover/social:bg-brand group-hover/social:text-on-brand">
                    <SocialIcon name={s.label} className="size-3.5" />
                  </span>
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          {/* The certifications the company holds, by name. The certificate
              numbers are on /about-us, which each one opens. */}
          <ul aria-label="Certifications" className="mt-4 flex flex-wrap gap-2.5">
            {credentials.map((c) => (
              <li key={c.id}>
                <SiteLink
                  href="/about-us#credentials"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-line-strong pr-4 pl-3 font-mono text-[0.6875rem] font-medium tracking-[0.06em] text-ink-2 md:h-9 transition-colors duration-300 hover:border-solid hover:border-ink hover:text-ink"
                >
                  <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-brand-ink" strokeWidth={1.8} />
                  {c.name}
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Services, Company and Marketing. Marketing is the only sitewide
            link into the four marketing discipline pages; on a phone it takes
            the full width under the other two. */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-[1.1fr_0.9fr_1.25fr] lg:gap-y-8"
        >
          {footerColumns.map((col, i) => (
            <div key={col.title} className={cn(i === footerColumns.length - 1 && "col-span-2 sm:col-span-1")}>
              <h2 className="font-mono text-eyebrow text-muted uppercase">{col.title}</h2>
              <ul className="mt-4 md:mt-5 md:space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <SiteLink
                      href={link.href}
                      className="group/link inline-flex min-h-11 items-center gap-2 text-body text-ink-2 md:min-h-0 transition-colors duration-300 hover:text-ink"
                    >
                      <span className="h-px w-0 shrink-0 bg-brand-ink transition-[width] duration-500 ease-out-expo group-hover/link:w-3" />
                      {link.label}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* ── The office ─────────────────────────────────────────────────────
          One office, so one band across the full width rather than a card in
          a grid built for several: the city set large with its local time on
          the left, the address and the ways to reach it on the right. */}
      <div className="container-zan pb-14">
        <section
          aria-labelledby={officeId}
          className="relative isolate overflow-hidden rounded-3xl border border-line bg-bg px-6 py-8 shadow-lift sm:px-10 sm:py-10"
        >
          {/* A warm bloom behind the city name. Decorative. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-48 -left-32 -z-10 size-[30rem] rounded-full bg-brand/15 blur-3xl"
          />
          {/* Four and eight columns from 1024px; inside the eight, the
              contact column takes a little more than half, so neither the
              email row (glyph and address, about 245px) nor the longest
              address line (about 207px) has to break, at 640px or at
              1024px. */}
          <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-4">
              <h2 id={officeId} className="flex items-center gap-2.5 font-mono text-eyebrow text-muted uppercase">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand" />
                Office
              </h2>
              <motion.h3
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="mt-4 font-display text-h1 text-ink"
              >
                <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                  <motion.span data-reveal className="block" variants={rise}>
                    {office.city}
                  </motion.span>
                </span>
              </motion.h3>
              <p className="mt-2 font-mono text-eyebrow text-muted uppercase">{office.country}</p>
              <OfficeClock timeZone={office.timeZone} still={reduce} />
            </div>

            <address className="grid gap-x-8 gap-y-8 not-italic sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:col-span-8 lg:pt-1">
              <div>
                <p className="font-mono text-eyebrow text-muted uppercase">Address</p>
                <p className="mt-4 text-body text-ink-2">
                  {office.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <p className="font-mono text-eyebrow text-muted uppercase">Contact</p>
                <ul className="mt-3 md:mt-4 md:space-y-2.5">
                  <li>
                    <a href={`tel:${office.phoneTel}`} className={cn(contactRow, "font-medium tabular-nums")}>
                      <span aria-hidden="true" className={cn(contactGlyph, "text-brand-ink")}>
                        <Phone className="size-4" />
                      </span>
                      {office.phoneDisplay}
                    </a>
                  </li>
                  <li>
                    <a
                      href={WHATSAPP_HREF}
                      target="_blank"
                      rel="noopener"
                      onClick={() => trackWhatsAppClick("Footer WhatsApp")}
                      className={contactRow}
                    >
                      <span aria-hidden="true" className={cn(contactGlyph, "text-whatsapp")}>
                        <SocialIcon name="WhatsApp" className="size-4" />
                      </span>
                      WhatsApp
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${site.email}`} className={cn(contactRow, "break-all")}>
                      <span aria-hidden="true" className={cn(contactGlyph, "text-brand-ink")}>
                        <Mail className="size-4" />
                      </span>
                      {site.email}
                    </a>
                  </li>
                </ul>
              </div>
            </address>
          </div>
        </section>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────
          Right padding on wider screens keeps the credit and "Back to top"
          clear of the floating buttons. */}
      <div className="container-zan">
        <div className="flex flex-col gap-4 border-t border-line py-6 pr-16 text-[0.8125rem] leading-relaxed text-muted sm:pr-20 lg:flex-row lg:items-start lg:justify-between lg:gap-8 min-[1400px]:pr-0">
          <p>
            © <span suppressHydrationWarning>{YEAR}</span> {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 md:gap-y-2 lg:max-w-md">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <SiteLink href={l.href} className="inline-flex min-h-11 items-center md:min-h-0 transition-colors duration-300 hover:text-ink">
                  {l.label}
                </SiteLink>
              </li>
            ))}
            {/* Where consent is changed or withdrawn, on every page: the Cookie
                Policy promises it can be, at any time. */}
            <li>
              <button
                type="button"
                onClick={openConsentSettings}
                className="inline-flex min-h-11 items-center md:min-h-0 transition-colors duration-300 hover:text-ink"
              >
                Cookie settings
              </button>
            </li>
          </ul>
          <div className="flex flex-col gap-2 lg:items-end lg:text-right">
            <SiteLink
              href="#main"
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink-2 md:min-h-0 transition-colors duration-300 hover:text-ink"
            >
              <ArrowUp aria-hidden="true" className="size-3.5" />
              Back to top
            </SiteLink>
          </div>
        </div>
      </div>

      {/* ── Wordmark ───────────────────────────────────────────────────────
          "ZAN VERSE" is about 5.3em wide in bold Geist at this tracking, so
          16vw spans some 85% of the screen at any width (about 305px of a
          360px phone). The 17.5rem cap stops it near 1,480px on very wide
          screens. */}
      <div ref={markRef} aria-hidden="true" className="pointer-events-none overflow-hidden select-none">
        <p className="text-center font-sans text-[clamp(3.5rem,16vw,17.5rem)] leading-[0.86] font-bold tracking-[-0.045em] whitespace-nowrap uppercase">
          {LETTERS.map((char, i) => (
            <WordmarkLetter key={i} char={char} index={i} progress={progress} still={reduce} />
          ))}
        </p>
      </div>
    </footer>
  );
}

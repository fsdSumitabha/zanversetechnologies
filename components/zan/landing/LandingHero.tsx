import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import { Check, FileLock2, ShieldCheck, Star } from "lucide-react";
import { GridField } from "@/components/zan/opening/GridField";
import "@/components/zan/opening/opening.css";
import { landingCopy, type LandingPage } from "@/constants/landing";
import { cn } from "@/lib/utils";
import { LandingForm } from "./LandingForm";

const REASSURANCE_ICONS = [FileLock2, ShieldCheck, Check] as const;
const delay = (d: number) => ({ "--zan-d": d }) as CSSProperties;

/** A headline's words, rising in turn from `from`. */
function Words({ text, from, className }: { text: string; from: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={word}>
          <span className={cn("zan-hero-word", className)} style={{ "--zan-w": from + i } as CSSProperties}>
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/**
 * The first screen, and the ask: the promise on the left, the form on the right.
 * On a phone the form follows the headline straight away and the proof waits
 * under it, because someone who clicked an ad should not have to scroll past
 * reassurance to reach the thing they came for.
 *
 * A server component with the homepage hero's ground and entrance: its grid
 * field and the same words rising into focus, CSS only, so the h1 paints with
 * the first frame and is the LCP at once. No canvas, no WebGL, and nothing here
 * waits on JavaScript but the form's own button.
 */
export function LandingHero({ page }: { page: LandingPage }) {
  const { heroForm, rating, ratingClients } = landingCopy;
  const leadWords = page.headline.lead.split(" ").length;

  return (
    <section
      id="enquiry"
      aria-labelledby="lp-hero-title"
      className="relative isolate scroll-mt-nav overflow-hidden bg-bg"
    >
      <div
        aria-hidden="true"
        data-reveal
        data-in="fade"
        className="zan-hero-in pointer-events-none absolute inset-0 -z-10"
      >
        <GridField className="zan-hero-grid size-full" />
      </div>

      {/* The site's astronaut, off the form's shoulder: wide screens only, where
          there is air for it above the panel. */}
      <div
        aria-hidden="true"
        className="zan-hero-astro pointer-events-none absolute top-[calc(var(--spacing-nav)-0.5rem)] right-[max(1rem,calc(50vw-46rem))] -z-[1] hidden w-28 xl:block 2xl:w-32"
      >
        <div data-reveal data-in="astro" className="zan-hero-in" style={delay(2)}>
          <div className="zan-hero-float">
            <Image
              src="/images/hero/astronaut.webp"
              alt=""
              width={500}
              height={500}
              sizes="8rem"
              /* Eager: lazily loaded it arrives after the headline's paint and takes
                 over as the page's LCP, late, for a decoration. It is a few KB. */
              loading="eager"
              className="h-auto w-full -scale-x-100 select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="container-zan grid gap-x-12 gap-y-8 pt-[calc(var(--spacing-nav)+1.5rem)] pb-12 sm:pt-[calc(var(--spacing-nav)+2.5rem)] lg:min-h-svh lg:grid-cols-12 lg:content-center lg:gap-y-7 lg:pt-[calc(var(--spacing-nav)+1.5rem)] lg:pb-14 xl:gap-x-16">
        {/* The query container the headline measures against. */}
        <div className="min-w-0 [container-type:inline-size] lg:col-span-7 lg:self-end">
          <h1
            id="lp-hero-title"
            /* Each line must fit the column at every width, so the size is the
               column's rather than the window's. The longest line on any page is
               "Marketing Judged On", 10.2em wide: 100 / 10.2 is 9.8, taken down
               for margin. A new page with a longer line needs this looking at. */
            style={{ fontSize: "min(5rem, 9.6cqi)" }}
            className="leading-[1] font-extrabold tracking-[-0.042em] text-ink [font-stretch:92%]"
          >
            {/* Part of the h1, not a label above it: what someone searched for and
                the city is the first thing this page says, to them and to the
                system scoring how well it matches the ad. It only looks small.
                A flex box of its own, so the h1's large line height stays out of it. */}
            <span
              data-reveal
              className="zan-hero-in mb-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-line bg-bg/80 px-3.5 py-1.5 text-[0.8125rem] leading-snug font-medium tracking-normal text-ink-2 shadow-lift [font-stretch:100%] sm:mb-6 sm:px-4 sm:text-small"
              style={delay(0)}
            >
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand" />
              <span>
                {page.eyebrow}
                <span className="sr-only">: </span>
              </span>
            </span>
            <span className="block">
              <Words text={page.headline.lead} from={0} />
            </span>
            <span className="block">
              <Words text={page.headline.accent} from={leadWords} className="text-brand-gradient" />
            </span>
          </h1>

          <p className="zan-lp-rise mt-5 max-w-[38rem] text-[1.0625rem] leading-relaxed text-pretty text-ink-2 sm:mt-6 sm:text-[1.1875rem]">
            {page.subhead}
          </p>
        </div>

        {/* The conversion. It spans both rows on the left, and data-lp-form is
            what tells the sticky button to step aside while this is on screen. */}
        <div
          data-reveal
          className="zan-hero-in min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center"
          style={delay(2)}
        >
          <div data-lp-form="" className="relative rounded-3xl border border-line bg-bg p-5 shadow-float sm:p-7">
            <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-brand-gradient" />
            <h2 className="font-display text-[1.625rem] leading-tight font-semibold tracking-[-0.012em] text-ink">
              {heroForm.title}
            </h2>
            <p className="mt-1.5 text-small text-ink-2">{heroForm.lead}</p>

            <LandingForm location="hero" className="mt-5" />

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-line pt-4">
              {heroForm.reassurances.map((text, i) => {
                const Icon = REASSURANCE_ICONS[i];
                return (
                  <li key={text} className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-2">
                    <Icon aria-hidden="true" className="size-3.5 shrink-0 text-brand-ink" strokeWidth={2} />
                    {text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Proof: this page's own results under a hairline, as the homepage sets
            its figures, then the rating beside real client marks. */}
        <div data-reveal className="zan-hero-in min-w-0 lg:col-span-7 lg:self-start" style={delay(3)}>
          <dl className="grid max-w-2xl grid-cols-3 border-t border-line pt-5">
            {page.outcomes.map((o, i) => (
              <div
                key={o.label}
                className={cn(
                  "flex flex-col-reverse justify-end gap-1.5 pr-2",
                  i > 0 && "border-l border-line pl-3 sm:pl-5",
                )}
              >
                <dt className="text-[0.75rem] leading-snug text-muted">{o.label}</dt>
                <dd className="font-hero text-[1.375rem] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums [font-stretch:92%] sm:text-[1.875rem]">
                  {o.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <ul aria-hidden="true" className="flex -space-x-2.5">
              {ratingClients.map((client) => (
                <li
                  key={client.name}
                  className="relative size-10 overflow-hidden rounded-full border-2 border-bg bg-bg shadow-lift ring-1 ring-line"
                >
                  <Image
                    src={client.src}
                    alt=""
                    width={40}
                    height={40}
                    className="size-full scale-[1.35] object-contain"
                  />
                </li>
              ))}
            </ul>
            <div>
              <p className="flex items-center gap-1.5">
                <span className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4 fill-brand text-brand" strokeWidth={1.5} />
                  ))}
                </span>
                <span className="text-small font-semibold text-ink">{rating.value}</span>
              </p>
              <p className="mt-0.5 text-small text-ink-2">
                {rating.trusted} <span className="font-semibold text-ink">{rating.clients}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { BadgeCheck, CalendarCheck, Check, Clock, LifeBuoy, Phone, Star, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/zan/page/Reveal";
import { ButtonLink } from "@/components/zan/ui/Button";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { landingCopy, landingStats, type LandingPage, type LandingStatId } from "@/constants/landing";
import { office } from "@/constants/zan";
import { CountFigure } from "./CountFigure";
import { QuoteButton } from "./QuoteButton";

const STAT_ICONS: Record<LandingStatId, LucideIcon> = {
  projects: BadgeCheck,
  clients: Users,
  rating: Star,
  "on-time": CalendarCheck,
  support: LifeBuoy,
  response: Clock,
};

/**
 * What the visitor gets for filling the form in, step by step, and the figures
 * that say it is safe to. The one thing the old pages led with here was the
 * price; with no price, the honest answer to "what happens next" does that job.
 */
export function NextSteps({ page }: { page: LandingPage }) {
  const { next, cta } = landingCopy;
  return (
    <section id="next" className="scroll-mt-nav border-t border-line bg-surface py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan grid items-center gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <SectionHeading
            eyebrow={next.eyebrow}
            title={next.title}
            lead={next.lead(page.label.toLowerCase())}
            size="h1"
            accentLine={1}
          />

          <ol className="mt-9 space-y-6">
            {next.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4">
                {/* The rule between one number and the next. */}
                {i < next.steps.length - 1 && (
                  <span aria-hidden="true" className="absolute top-11 -bottom-5 left-[1.1875rem] w-px bg-line-strong" />
                )}
                <span
                  aria-hidden="true"
                  className="grid size-[2.4375rem] shrink-0 place-items-center rounded-full border border-line-strong bg-bg font-mono text-[0.75rem] text-brand-ink"
                >
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="text-body font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 max-w-[48ch] text-small text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {next.points.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5 text-small font-medium text-ink-2">
                <Check aria-hidden="true" className="size-4 shrink-0 text-brand-ink" strokeWidth={2.2} />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <QuoteButton location="next_steps" size="lg">
              {cta.primary}
            </QuoteButton>
            <ButtonLink
              href={`tel:${office.phoneTel}`}
              variant="secondary"
              size="lg"
              arrow={false}
              data-analytics-label="Landing Next Steps"
              icon={<Phone aria-hidden="true" className="size-4 shrink-0 text-brand-ink" />}
            >
              <span className="tabular-nums">{office.phoneDisplay}</span>
            </ButtonLink>
          </div>
        </div>

        {/* The figures, with this page's best result set large on the gold. */}
        <Reveal className="min-w-0 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-7 text-on-brand sm:p-9">
            <p className="font-hero text-[clamp(3.25rem,2.2rem+5vw,5.75rem)] leading-[0.9] font-extrabold tracking-[-0.045em] tabular-nums [font-stretch:92%]">
              <CountFigure value={page.proof.value} />
            </p>
            <p className="mt-3 max-w-[30ch] text-lead leading-snug font-medium">{page.proof.label}</p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {landingStats.map((stat) => {
              const Icon = STAT_ICONS[stat.id];
              return (
                <div key={stat.id} className="flex min-w-0 flex-col-reverse justify-end bg-bg p-5">
                  <dt className="mt-1.5 text-[0.8125rem] leading-snug text-muted">{stat.label}</dt>
                  <dd>
                    <Icon aria-hidden="true" className="mb-3 size-5 text-brand-ink" strokeWidth={1.8} />
                    <CountFigure
                      value={stat.value}
                      className="block font-hero text-[1.625rem] leading-none font-bold tracking-[-0.03em] whitespace-nowrap text-ink tabular-nums [font-stretch:92%] sm:text-[1.875rem]"
                    />
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

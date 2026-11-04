import { Reveal } from "@/components/zan/page/Reveal";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { closingStats, landingCopy, type LandingPage } from "@/constants/landing";
import { CountFigure } from "./CountFigure";
import { LandingForm } from "./LandingForm";
import { Skyline } from "./Skyline";

/**
 * The ask again, for anyone who read the whole page, over Dubai. It carries the
 * second form on the page, so the sticky button stands down while this is on
 * screen rather than covering it.
 */
export function Closing({ page }: { page: LandingPage }) {
  const { closing, cta } = landingCopy;
  return (
    <section
      id="enquiry-bottom"
      className="relative isolate scroll-mt-nav overflow-hidden border-t border-border bg-accent-wash pt-[clamp(4rem,2.8rem+4.6vw,7rem)]"
    >
      <div className="container-zan relative z-10 grid items-start gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-6">
          <SectionHeading
            title={closing.title}
            lead={closing.lead(page.label.toLowerCase())}
            size="h1"
            accentLine={1}
          />

          <Reveal>
            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {closingStats.map((stat) => (
                <div key={stat.id} className="flex flex-col-reverse justify-end bg-surface px-4 py-4">
                  <dt className="mt-1.5 text-[0.75rem] leading-snug text-subtle">{stat.label}</dt>
                  <dd>
                    <CountFigure
                      value={stat.value}
                      className="block font-hero text-[1.5rem] leading-none font-bold tracking-[-0.03em] text-foreground tabular-nums [font-stretch:92%]"
                    />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-small text-muted">{closing.served}</p>
          </Reveal>
        </div>

        <Reveal className="min-w-0 lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <div data-lp-form="" className="relative rounded-3xl border border-border bg-surface p-5 shadow-float sm:p-7">
            <span aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-accent-gradient" />
            <h3 className="font-display text-[1.625rem] leading-tight font-semibold tracking-[-0.012em] text-foreground">
              {closing.form.title}
            </h3>
            <p className="mt-1.5 text-small text-muted">{closing.form.lead}</p>
            <LandingForm location="closing" submitLabel={cta.closing} className="mt-5" />
          </div>
        </Reveal>
      </div>

      <Skyline />
    </section>
  );
}

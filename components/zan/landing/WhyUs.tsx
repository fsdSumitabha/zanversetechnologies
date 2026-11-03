import { Reveal } from "@/components/zan/page/Reveal";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { landingCopy } from "@/constants/landing";

/**
 * The six reasons, set as an index rather than six more cards: the heading stays
 * put on wide screens while the list passes it, and the numbers do the work an
 * icon in a coloured square usually does, with less noise.
 */
export function WhyUs() {
  const { why } = landingCopy;
  return (
    <section id="why-us" className="scroll-mt-nav border-t border-border bg-surface-muted py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+2.5rem)]">
            <SectionHeading eyebrow={why.eyebrow} title={why.title} size="h1" accentLine={1} />
          </div>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:col-span-8">
          {why.reasons.map((reason, i) => (
            <li key={reason.id} className="min-w-0 bg-surface">
              <Reveal delay={Math.min(i, 3) * 0.05} className="group/why h-full p-6 sm:p-7">
                <span className="flex items-center gap-3 font-mono text-eyebrow text-accent-ink">
                  {String(i + 1).padStart(2, "0")}
                  <span
                    aria-hidden="true"
                    className="h-px w-5 bg-border-strong transition-[width,background-color] duration-500 ease-out-expo group-hover/why:w-10 group-hover/why:bg-accent-ink"
                  />
                </span>
                <h3 className="mt-5 font-display text-h3 font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-1.5 font-mono text-[0.6875rem] leading-relaxed tracking-[0.12em] text-subtle uppercase">
                  {reason.tagline}
                </p>
                <p className="mt-3.5 text-small text-muted">{reason.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Reveal } from "@/components/zan/page/Reveal";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import type { CSSProperties } from "react";
import { landingCopy, landingProjects, type LandingComparison, type LandingPage } from "@/constants/landing";
import type { Project } from "@/constants/zan";
import { cn } from "@/lib/utils";
import { CountFigure } from "./CountFigure";
import { QuoteButton } from "./QuoteButton";

const mono = "font-mono text-eyebrow uppercase";

/**
 * One engagement, in the order a sceptical visitor asks for it: what the problem
 * was, what we built, and then, across the foot, what changed. Every word and
 * figure is /portfolio's. The photograph is sector imagery, never captioned as
 * the build itself.
 */
function CaseStudy({ project, flip }: { project: Project; flip: boolean }) {
  const { work } = landingCopy;
  const figures = project.results.length;
  return (
    <Reveal>
      <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-lift">
        <div className="grid lg:grid-cols-12">
          <div
            className={cn("relative aspect-[16/9] bg-surface-muted lg:col-span-5 lg:aspect-auto", flip && "lg:order-last")}
          >
            {project.screenshot && (
              <Image
                src={project.screenshot.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 34vw, 92vw"
                className="object-cover"
              />
            )}
          </div>

          <div className="min-w-0 p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <p className={cn(mono, "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-subtle")}>
              <span className="text-accent-ink">{project.discipline}</span>
              <span aria-hidden="true">/</span>
              <span>{project.industry}</span>
              <span aria-hidden="true">/</span>
              <span>{project.timeline}</span>
            </p>
            <h3 className="mt-4 font-display text-h2 text-balance text-foreground">{project.name}</h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className={cn(mono, "text-subtle")}>{work.brief}</h4>
                <p className="mt-2.5 text-small text-muted">{project.challenge}</p>
              </div>
              <div>
                <h4 className={cn(mono, "text-subtle")}>{work.built}</h4>
                <p className="mt-2.5 text-small text-muted">{project.solution}</p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[0.8125rem] leading-none text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl
          className={cn(
            "grid gap-px border-t border-border bg-border",
            figures === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {project.results.map((result) => (
            <div
              key={result.metric}
              className="flex min-w-0 flex-col-reverse justify-end bg-surface-muted px-4 py-5 sm:px-8 sm:py-6"
            >
              <dt className="mt-2 text-[0.8125rem] leading-snug text-subtle">{result.metric}</dt>
              <dd>
                <CountFigure
                  value={result.value}
                  className="block font-hero text-[clamp(1.375rem,1rem+1.9vw,2.5rem)] leading-none font-bold tracking-[-0.035em] text-foreground tabular-nums [font-stretch:92%]"
                />
              </dd>
            </div>
          ))}
        </dl>
      </article>
    </Reveal>
  );
}

/**
 * The "which one do I need" table, so a visitor can answer that for themselves
 * before they ever talk to anyone. A real table, for any number of options.
 *
 * On a phone each row gives its feature a line of its own and the options share
 * the width beneath it, so they stay side by side, which is the point of the
 * thing, rather than becoming cards. Laying a table out as a grid strips its
 * table semantics in some browsers, so the roles are written out.
 */
function Comparison({ data }: { data: LandingComparison }) {
  const { work } = landingCopy;
  const lit = "bg-accent-veil";
  const row = "grid grid-cols-[repeat(var(--lp-options),minmax(0,1fr))] sm:table-row";
  return (
    <Reveal className="mt-14 sm:mt-20">
      <div className="max-w-3xl">
        <p className={cn(mono, "text-accent-ink")}>{work.compareEyebrow}</p>
        <h3 className="mt-4 font-display text-h2 text-balance text-foreground">{data.title}</h3>
        <p className="mt-3 text-body text-muted">{data.description}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
        <table
          role="table"
          style={{ "--lp-options": data.options.length } as CSSProperties}
          className="block w-full border-collapse text-left sm:table sm:table-fixed"
        >
          <colgroup>
            <col className="sm:w-[24%]" />
            {data.options.map((option) => (
              <col key={option} />
            ))}
          </colgroup>
          <thead role="rowgroup" className="block sm:table-header-group">
            <tr role="row" className={cn(row, "border-b border-border-strong")}>
              <th
                role="columnheader"
                scope="col"
                className={cn(mono, "hidden px-3 py-4 align-bottom font-normal text-subtle sm:table-cell sm:px-6")}
              >
                {data.feature}
              </th>
              {data.options.map((option, i) => (
                <th
                  key={option}
                  role="columnheader"
                  scope="col"
                  className={cn(
                    "px-3 py-4 align-bottom text-[0.8125rem] leading-snug font-semibold text-foreground sm:px-6 sm:font-display sm:text-lead",
                    i === data.highlight && lit,
                  )}
                >
                  {option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup" className="block sm:table-row-group">
            {data.rows.map((item) => (
              <tr key={item.feature} role="row" className={cn(row, "border-b border-border last:border-b-0")}>
                <th
                  role="rowheader"
                  scope="row"
                  className="col-span-full px-3 pt-3.5 align-top text-[0.8125rem] leading-snug font-semibold text-foreground sm:table-cell sm:px-6 sm:py-4 sm:text-small sm:font-medium"
                >
                  {item.feature}
                </th>
                {item.values.map((value, i) => (
                  <td
                    key={`${i}-${value}`}
                    role="cell"
                    className={cn(
                      "px-3 pt-1 pb-3.5 align-top text-[0.8125rem] leading-snug text-muted sm:table-cell sm:px-6 sm:py-4 sm:text-small",
                      i === data.highlight && cn(lit, "text-foreground"),
                    )}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-5 rounded-3xl border border-border bg-surface-muted p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
          <p className={cn(mono, "text-accent-ink")}>{work.verdict}</p>
          <p className="mt-3 text-body text-foreground">{data.recommendation}</p>
        </div>
        <QuoteButton location="comparison" size="lg" className="w-full shrink-0 sm:w-auto">
          {work.more}
        </QuoteButton>
      </div>
    </Reveal>
  );
}

export function Work({ page }: { page: LandingPage }) {
  const { work } = landingCopy;
  return (
    <section id="work" className="scroll-mt-nav border-t border-border bg-canvas py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan">
        <SectionHeading eyebrow={work.eyebrow} title={work.title} size="h1" accentLine={1} />

        <div className="mt-10 space-y-6 sm:mt-12">
          {landingProjects(page).map((project, i) => (
            <CaseStudy key={project.id} project={project} flip={i % 2 === 1} />
          ))}
        </div>

        <Comparison data={page.comparison} />
      </div>
    </section>
  );
}

"use client";

import { ArrowDownRight } from "lucide-react";
import { ScrollRevealCurtain } from "@/components/animations/ScrollRevealCurtain";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { chapters, deckPractices, practiceAnchor, servicesIntro } from "@/constants/zan";
import { useSiteHref } from "@/lib/useSiteHref";

/**
 * Chapter 01: What we do.
 *
 * An intro to the four areas the services deck covers: the heading beside a
 * list whose rows each link to their panel. Then the chapter curtain, a flat
 * light bg-accent-soft panel, rises over it and ends covering the stage; the
 * deck opens on a flat bg-accent-soft panel, so the hand-off is one surface.
 */
export function ChapterWhatWeDo() {
  const chapter = chapters.whatWeDo;

  return (
    <ScrollRevealCurtain
      id="what-we-do"
      distance={1.2}
      curtainClassName="bg-accent-soft text-foreground"
      beneath={<PracticesIntro />}
      label={
        <div className="flex flex-col items-center gap-6">
          <Eyebrow>{chapter.eyebrow}</Eyebrow>
          <p className="font-sans text-giant font-bold text-foreground uppercase">
            {chapter.label.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      }
    />
  );
}

function PracticesIntro() {
  const href = useSiteHref();
  return (
    <div className="relative flex items-center bg-canvas py-section lg:motion-safe:h-full lg:motion-safe:pt-[calc(var(--spacing-nav,4.5rem)+1.5rem)] lg:motion-safe:pb-8">
      <div className="container-zan grid w-full gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <SectionHeading eyebrow={servicesIntro.eyebrow} title={servicesIntro.title} lead={servicesIntro.lead} />

        <ul className="border-t border-border">
          {deckPractices.map((p) => (
            <li key={p.id} className="border-b border-border">
              <a
                href={href(practiceAnchor(p.id))}
                className="group/row flex items-center gap-5 py-3.5 transition-colors duration-300 sm:gap-7 sm:py-5"
              >
                <span className="w-6 shrink-0 font-mono text-eyebrow text-accent-ink">{p.index}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-h3 text-foreground transition-colors duration-300 group-hover/row:text-accent-ink">
                    {p.title}
                  </span>
                  <span className="mt-0.5 block text-small text-muted">{p.tagline}</span>
                </span>
                <ArrowDownRight
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="size-5 shrink-0 text-subtle transition-[transform,color] duration-300 ease-out-expo group-hover/row:translate-x-0.5 group-hover/row:translate-y-0.5 group-hover/row:text-accent-ink"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

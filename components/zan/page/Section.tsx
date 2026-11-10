import type { ReactNode } from "react";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const GROUNDS = {
  bg: "bg-canvas",
  surface: "bg-surface-muted",
  surface2: "bg-surface-muted",
} as const;

export type SectionTone = keyof typeof GROUNDS;

/**
 * The ground of the band at this position after a page's hero: the page ground
 * first, as every standing page opens, then turn about. A page with bands that
 * come and go counts its bands and asks here, so no two neighbours ever match.
 */
export const toneAt = (position: number): SectionTone => (position % 2 === 0 ? "bg" : "surface");

/**
 * One band of a standing page: a hairline, the page ground or a surface, and
 * an optional eyebrow + heading pair above the content. Deliberately plain —
 * these pages are read top to bottom, so the rhythm comes from the spacing and
 * the grounds alternating, not from a new device per section.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  aside,
  tone = "bg",
  landmark = true,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  /** Short by design, except a copy file's search phrase, which can run to a few lines. */
  title?: string;
  lead?: string;
  /** Opposite the heading: a link, a note. */
  aside?: ReactNode;
  tone?: SectionTone;
  /**
   * A band named by its heading is a landmark, and landmarks are the short list
   * of a page's main parts. False for one of several written sections: the id
   * still gives it an address, and the heading is how a reader finds it.
   */
  landmark?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title && landmark ? headingId : undefined}
      /* One vertical scale for every standing page, deliberately tighter than
         the homepage's `py-section`: these bands are read in sequence rather
         than pinned one screen at a time. */
      className={cn(
        "scroll-mt-nav border-t border-border py-[clamp(3.5rem,2.6rem+3.8vw,6rem)]",
        GROUNDS[tone],
        className,
      )}
    >
      <div className="container-zan">
        {(eyebrow || title) && (
          <Reveal className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-3xl">
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && (
                <h2 id={headingId} className={cn("font-display text-h1 text-balance text-foreground", eyebrow && "mt-4")}>
                  {title}
                </h2>
              )}
              {lead && <p className="mt-5 max-w-[58ch] text-lead text-muted">{lead}</p>}
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

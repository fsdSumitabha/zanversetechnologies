import type { ReactNode } from "react";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { labels } from "@/constants/pages";
import type { ContentSection, SourceLink } from "@/constants/services/types";
import { site } from "@/constants/zan";
import { Section, toneAt, type SectionTone } from "./Section";

/* ───────────────────────────────────────────────────────────────────────────
   THE WRITTEN PART OF A STANDING PAGE

   What a copy file (constants/services, constants/guides) holds, set in the
   classes the standing pages already use: the `Section` band, the body text and
   the list dots of LegalDocumentView, the inline link of /contact-us and the
   quiet closing band of /disclaimer. There is no type style of its own here.

   THE PARAGRAPHS DO NOT REVEAL. `Section` still brings its heading in, as it does
   everywhere, but the words under it are at rest from the first paint, so a
   reader or a crawler that does not scroll has them.
   ─────────────────────────────────────────────────────────────────────────── */

/** A link inside running text. */
export const inlineLink =
  "font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-300 hover:text-accent-ink hover:decoration-current";

const quietLink =
  "underline decoration-border-strong underline-offset-2 transition-colors duration-300 hover:text-foreground";

/**
 * The address of a written section: its heading as an id, so a link or an answer
 * engine can point at one passage. The heading is unique within its copy file and
 * far longer than any id the page's other bands use.
 */
export const sectionAnchor = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The sections of a copy file, one band each, in turn from `startAt`: the number
 * of bands above them on the page. The first band after a hero is position 0, and
 * the page continues from `startAt + sections.length`.
 */
export function ContentSections({
  sections,
  startAt = 0,
}: {
  sections: readonly ContentSection[];
  startAt?: number;
}) {
  return (
    <>
      {sections.map((section, i) => (
        <Section
          key={section.heading}
          id={sectionAnchor(section.heading)}
          tone={toneAt(startAt + i)}
          title={section.heading}
          landmark={false}
        >
          <div className="max-w-[72ch]">
            {section.paragraphs.map((paragraph, n) => (
              <p key={n} className="mt-4 text-body text-muted first:mt-0">
                {paragraph}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-4 space-y-2.5 text-body text-muted first:mt-0">
                {section.bullets.map((bullet, n) => (
                  <li key={n} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.links && section.links.length > 0 && (
              <p className="mt-4 text-body text-muted first:mt-0">
                {labels.seeAlso}:{" "}
                {section.links.map((link, n) => (
                  <span key={link.href}>
                    {n > 0 && ", "}
                    <SiteLink href={link.href} className={inlineLink}>
                      {link.label}
                    </SiteLink>
                  </span>
                ))}
              </p>
            )}
          </div>
        </Section>
      ))}
    </>
  );
}

/** The outside sources a page rests on. Nothing at all for a page with none. */
export function SourcesList({ sources }: { sources?: readonly SourceLink[] }) {
  if (!sources?.length) return null;
  return (
    <div>
      <h2 className="font-mono text-eyebrow text-subtle uppercase">{labels.sources}</h2>
      <ul className="mt-4 space-y-2.5 text-small text-muted">
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} target="_blank" rel="noopener" className={quietLink}>
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** "2026-11-05" as "5 November 2026". By hand, so no time zone can move it a day. */
function longDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/**
 * When the page last changed and who is answerable for it. The date is the one
 * the sitemap and the structured data give (constants/freshness.ts, or the
 * guide's own), so the three cannot disagree. The company rather than a person,
 * because no one person has been credited as the writer of a page.
 */
export function UpdatedLine({ date }: { date: string }) {
  return (
    <p className="text-small text-muted">
      Last updated <time dateTime={date}>{longDate(date)}</time> by the {site.name}{" "}
      <SiteLink href="/our-team" className={quietLink}>
        team
      </SiteLink>
    </p>
  );
}

/**
 * A page's last band, for `SourcesList` and `UpdatedLine`: the page's words end
 * above it. The tighter padding is the credits band at the foot of /disclaimer.
 */
export function PageNotes({ tone, children }: { tone: SectionTone; children: ReactNode }) {
  return (
    <Section tone={tone} className="py-[clamp(2.5rem,2rem+2vw,4rem)]">
      <div className="max-w-[72ch] space-y-6">{children}</div>
    </Section>
  );
}

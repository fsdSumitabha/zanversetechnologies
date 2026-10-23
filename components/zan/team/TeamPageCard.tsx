import { ArrowUpRight, Mail } from "lucide-react";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { Portrait } from "@/components/zan/team/Portrait";
import type { Person } from "@/constants/zan";
import { cn } from "@/lib/utils";

/* The two cards /our-team is built from. Both are plain server markup: every
   name, role, year figure, description and profile URL is in the HTML, and
   nothing here is revealed by hovering or by JavaScript.

   The homepage's PersonCard is the same person in a 21rem rail slot. This is
   the same data with room: a frame two-thirds larger again, the description at
   body size rather than squeezed, and the profile a labelled link rather than
   a bare glyph, because on the page that carries them the links are half the
   reason someone came.

   `experience`, `description`, `email`, `linkedin` and `portrait` are each
   optional and each rendered only when it is set. Nothing is ever drawn as an
   empty frame, a blank row or a link that goes nowhere, which is what lets the
   director's card carry exactly what we were given for him and stop there. */

const card =
  "zan-person flex h-full flex-col rounded-3xl border border-line bg-bg p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift sm:p-7";

/** A labelled link out, sized to a 44px tap target. */
const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-small font-medium text-ink-2 transition-[color,background-color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand-ink";

/**
 * One colleague, under their practice's heading.
 *
 * The frame is `zan-person-plate`: 7rem here and 9rem once the card has a
 * whole row to itself, which is the container query in teamPage.css rather
 * than a breakpoint, because what matters is how wide THIS card is.
 */
export function TeamPersonCard({ person }: { person: Person }) {
  const footer = Boolean(person.experience || person.linkedin || person.email);
  return (
    <article className={card}>
      <div className="zan-person-top grow">
        <Portrait
          person={person}
          sizes="144px"
          className="zan-person-plate size-28 rounded-[1.25rem]"
          monogramClassName="text-h2"
        />
        <div className="min-w-0">
          <h3 className="font-display text-h3 font-semibold text-ink">{person.name}</h3>
          <p className="mt-1.5 text-small font-medium text-brand-ink">{person.role}</p>
          {person.description && (
            <p className="mt-4 max-w-[58ch] text-body text-ink-2">{person.description}</p>
          )}
        </div>
      </div>

      {/* A card with no years and no links would otherwise end on a hairline
          under nothing.

          The years and the links are stacked rather than set at either end of
          one row. Side by side they fit on one line for a card with a single
          link and wrap onto two for a card with both, which put the hairline
          at a different height on every card in a row of three. Stacked, the
          footer is the same height on all of them and the row's hairlines
          line up. */}
      {footer && (
        <div className="mt-7 border-t border-line pt-5">
          {person.experience && (
            <dl className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="font-mono text-eyebrow text-muted uppercase">Experience</dt>
              <dd className="font-mono text-small font-medium text-brand-ink tabular-nums">
                {person.experience}
              </dd>
            </dl>
          )}
          <PersonLinks person={person} className={person.experience ? "mt-4" : undefined} />
        </div>
      )}
    </article>
  );
}

/**
 * The profile links, labelled. The rail card draws these as bare glyphs
 * because a 21rem card has no width to spare; here the word is spelled out, so
 * "the LinkedIn link" is something a visitor can see rather than decode.
 *
 * Each `aria-label` names the person and still contains the visible word, so
 * the accessible name says whose profile it is without contradicting the label
 * someone reads out to a voice control.
 */
function PersonLinks({ person, className }: { person: Person; className?: string }) {
  if (!person.linkedin && !person.email) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {person.linkedin && (
        <li>
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener"
            aria-label={`${person.name} on LinkedIn (opens in a new tab)`}
            className={pill}
          >
            <SocialIcon name="LinkedIn" className="size-4 shrink-0" />
            LinkedIn
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
        </li>
      )}
      {person.email && (
        <li>
          {/* The address is in the href and nowhere else: a visitor gets the
              link, a scraper reading the page's text does not get a list of
              addresses. */}
          <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`} className={pill}>
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            Email
          </a>
        </li>
      )}
    </ul>
  );
}

/**
 * The director, inside the hero's panel. The panel supplies the card — its
 * hairline, its ground and its "Leadership" label — so this is only the person
 * inside it, and the heading level picks up below the panel's own.
 *
 * Name, job title, headshot and profile link, because those are what we were
 * given. No description was supplied and none is invented; the moment one
 * arrives it is a line in constants/zan.ts and it renders here, under the
 * title. The links are the same labelled pills the practice cards use.
 */
export function TeamLeadCard({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-5">
      <Portrait
        person={person}
        sizes="112px"
        className="size-20 rounded-[1.25rem] sm:size-24"
        monogramClassName="text-h2"
      />
      <div className="min-w-0">
        {/* The panel is narrower between 1024 and 1280 than it is above it,
            where "Nadim Ali" at h2 wraps onto a second line. h2 only once the
            column is wide enough to hold a name on one. */}
        <h3 className="font-display text-h3 font-semibold text-balance text-ink xl:text-h2">
          {person.name}
        </h3>
        <p className="mt-1.5 text-small font-medium text-brand-ink">{person.role}</p>
        {person.description && <p className="mt-3 max-w-[46ch] text-small text-ink-2">{person.description}</p>}
        <PersonLinks person={person} className="mt-4" />
      </div>
    </div>
  );
}

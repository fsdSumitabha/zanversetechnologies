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
   director's card carry exactly what we were given for him and stop there.

   EVERY CARD IS AN ANCHOR. Its outermost element carries the person's `id`, so
   /our-team#karthikeyan opens on that card, and the structured data gives that
   address as the person's `url` (lib/schema.ts). Only this page renders these
   two cards and each person once, so no id repeats, and constants/zan.ts keeps
   a person's id clear of the page's other ids. `scroll-mt-nav`, as every
   anchor target on the standing pages has, keeps the fixed bar off the name.
   It moves nothing on screen: it only changes where a jump to the card stops. */

const card =
  "zan-person flex h-full scroll-mt-nav flex-col rounded-3xl border border-border bg-surface p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift sm:p-7";

/** A labelled link out, sized to a 44px tap target. */
const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface-muted px-4 text-small font-medium text-muted transition-[color,background-color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft hover:text-accent-ink";

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
    <article id={person.id} className={card}>
      <div className="zan-person-top grow">
        <Portrait
          person={person}
          sizes="144px"
          className="zan-person-plate size-28 rounded-[1.25rem]"
          monogramClassName="text-h2"
        />
        <div className="min-w-0">
          <h3 className="font-display text-h3 font-semibold text-foreground">{person.name}</h3>
          <p className="mt-1.5 text-small font-medium text-accent-ink">{person.role}</p>
          {person.description && (
            <p className="mt-4 max-w-[58ch] text-body text-muted">{person.description}</p>
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
        <div className="mt-7 border-t border-border pt-5">
          {person.experience && (
            <dl className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="font-mono text-eyebrow text-subtle uppercase">Experience</dt>
              <dd className="font-mono text-small font-medium text-accent-ink tabular-nums">
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
 * Name, job title, headshot, the approved line and the profile link: what
 * constants/zan.ts holds for him. The line sits under the title, at the
 * panel's smaller size and narrower measure, and no years were given, so there
 * is no Experience row. The links are the same labelled pills the practice
 * cards use. The outer element is his card's anchor, /our-team#nadim, like
 * every practice card's.
 */
export function TeamLeadCard({ person }: { person: Person }) {
  return (
    <div id={person.id} className="flex scroll-mt-nav items-center gap-5">
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
        <h3 className="font-display text-h3 font-semibold text-balance text-foreground xl:text-h2">
          {person.name}
        </h3>
        <p className="mt-1.5 text-small font-medium text-accent-ink">{person.role}</p>
        {person.description && <p className="mt-3 max-w-[46ch] text-small text-muted">{person.description}</p>}
        <PersonLinks person={person} className="mt-4" />
      </div>
    </div>
  );
}

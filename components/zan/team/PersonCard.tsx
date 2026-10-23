import { Mail } from "lucide-react";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { Portrait } from "@/components/zan/team/Portrait";
import type { Person } from "@/constants/zan";

/* One colleague, in a 21rem rail slot. Plain server markup: the name, the
   role and the description are in the HTML, and nothing here is revealed by
   hovering.

   Every optional field is rendered only when it is set, so the card is
   finished without any of them and better with every one that arrives, and
   nothing is ever drawn as an empty frame or a link that goes nowhere. The
   frame itself is shared with /our-team (Portrait.tsx), so a headshot that
   lands looks the same in both places.

   The profile links are bare glyphs here because a card this narrow has no
   width for a word beside them. On /our-team, where the card is half as wide
   again and the links are half the reason someone came, they are spelled out
   (TeamPageCard.tsx). */

const card =
  "group/person flex h-full flex-col rounded-3xl border border-line bg-bg p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift sm:p-7";

const chip =
  "grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-[color,background-color,border-color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand-ink";

export function PersonCard({ person }: { person: Person }) {
  const reachable = Boolean(person.email || person.linkedin);
  return (
    <article className={card}>
      <div className="grow">
        <Portrait
          person={person}
          sizes="80px"
          className="size-20"
          monogramClassName="text-h2"
        />
        <h4 className="mt-5 font-display text-h3 font-semibold text-ink">{person.name}</h4>
        <p className="mt-1.5 text-small font-medium text-brand-ink">{person.role}</p>
        {person.description && <p className="mt-3.5 text-body text-ink-2">{person.description}</p>}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-5">
        {person.experience && (
          <dl className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <dt className="font-mono text-eyebrow text-muted uppercase">Experience</dt>
            <dd className="font-mono text-small font-medium text-brand-ink tabular-nums">{person.experience}</dd>
          </dl>
        )}

        {reachable && (
          <ul className="flex items-center gap-2">
            {person.email && (
              <li>
                {/* The address is in the href and nowhere else: a visitor gets
                    the link, a scraper reading the page's text does not get a
                    list of addresses. */}
                <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`} className={chip}>
                  <Mail aria-hidden="true" className="size-4" />
                </a>
              </li>
            )}
            {person.linkedin && (
              <li>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${person.name} on LinkedIn (opens in a new tab)`}
                  className={chip}
                >
                  <SocialIcon name="LinkedIn" className="size-4" />
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

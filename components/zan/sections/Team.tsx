import { Fragment } from "react";
import "@/components/zan/team/team.css";
import { Reveal } from "@/components/zan/page/Reveal";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { PersonCard } from "@/components/zan/team/PersonCard";
import { TeamRail } from "@/components/zan/team/TeamRail";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { team, teamGroups, teamIntro } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   THE TEAM (#team) — between the company's story and the questions it gets
   asked: the people who do the work, by name, under the practice they work in.

   A rail rather than a grid. Five cards carrying a description do not fit any
   viewport this site supports, so there is always travel in it, which is the
   only thing that earns a slider over a grid. The two groups are marked inside
   the track, each name set down a hairline, so the grouping survives the fact
   that only part of the rail is ever on screen. Under prefers-reduced-motion
   the same list is a grid of all five and the controls go away (team.css).

   PHOTOGRAPHS: each card leads with the person's own headshot, from
   `portrait` in constants/zan.ts, in the frame Portrait.tsx shares with
   /our-team. Anyone without one gets a monogram in that frame, never the
   stock photography the collage above uses, which is not Zan's team.

   It is a TEASER, not the whole thing. /our-team shows the same five under
   the same two headings with the room a rail cannot give them, and the
   director above both, so the rail ends on the way in rather than on nothing.

   Every card is plain server markup inside the client rail, so the names, the
   roles and the descriptions are all in the HTML, and the only motion is the
   standing pages' Reveal.
   ─────────────────────────────────────────────────────────────────────────── */

export function Team() {
  // Running position across both groups: the slide labels and the live region
  // count the five people, not the two tracks they are split into.
  let n = 0;
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className="relative scroll-mt-nav overflow-x-clip border-t border-line bg-surface py-section"
    >
      <div className="container-zan">
        <SectionHeading
          id="team-heading"
          eyebrow={teamIntro.eyebrow}
          title={teamIntro.title}
          lead={teamIntro.lead}
        />
      </div>

      {/* Without JavaScript the buttons are inert and the progress line never
          moves, while the rail itself is still a native scroller. Hide the
          row rather than offer a dead control. */}
      <noscript>
        <style>{`.zan-team-controls{display:none}`}</style>
      </noscript>

      <div className="mt-12 lg:mt-16">
        <TeamRail label={teamIntro.eyebrow} names={team.map((p) => p.name)}>
          {teamGroups.map((group) => (
            <Fragment key={group.id}>
              <li className="zan-team-marker">
                <span aria-hidden="true" className="zan-team-dot" />
                <h3 className="zan-team-marker-label font-mono text-eyebrow text-ink uppercase">{group.label}</h3>
                <span aria-hidden="true" className="zan-team-rule" />
              </li>
              {group.people.map((person) => {
                const i = n++;
                return (
                  <li
                    key={person.id}
                    data-person=""
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${team.length}: ${person.name}, ${person.role}`}
                    className="zan-team-slide"
                  >
                    <Reveal delay={Math.min(i, 3) * 0.05} className="h-full">
                      <PersonCard person={person} />
                    </Reveal>
                  </li>
                );
              })}
            </Fragment>
          ))}
        </TeamRail>
      </div>

      {/* The way out of the rail. Five cards shown one or two at a time are
          never all on screen at once, and a slider that only ever loops back
          on itself is a dead end. */}
      <div className="container-zan mt-10 lg:mt-12">
        <Reveal>
          <SiteButtonLink href={teamIntro.more.href} variant="secondary" size="lg">
            {teamIntro.more.label}
          </SiteButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

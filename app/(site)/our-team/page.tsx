import type { Metadata } from "next";
import "@/components/zan/team/teamPage.css";
import { PageHero } from "@/components/zan/page/PageHero";
import { Reveal } from "@/components/zan/page/Reveal";
import { Section } from "@/components/zan/page/Section";
import { HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { TeamLeadCard, TeamPersonCard } from "@/components/zan/team/TeamPageCard";
import { labels, ourTeamPage, pageTrail } from "@/constants/pages";
import { ctas, teamGroups, teamLead } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: ourTeamPage.seoTitle,
  description: ourTeamPage.seoDescription,
  path: "/our-team",
});

/* ───────────────────────────────────────────────────────────────────────────
   /our-team — the homepage's rail, with room.

   The rail is five cards on a track that always has somewhere left to go; this
   is the same five under their practice headings, at a size that lets the
   description be read rather than glimpsed, with the profile links spelled out.
   Same data (constants/zan.ts), so the two can never say different things.

   The director sits in the hero's panel rather than in a band of his own: the
   card we can honestly build for him is a name and a job title, and a name and
   a job title alone across 1224px of page would be a band mostly made of
   nothing. In the panel it is the first thing on the page at every width, above
   both groups, and it fills the hero with something specific to this page
   instead of the facts two other pages already show there.

   BreadcrumbList rides along with `trail`, exactly as it does on the other
   standing pages (components/zan/page/Breadcrumbs.tsx). The grid and the one
   place a card changes shape are in teamPage.css, with the four widths they
   were checked at.
   ─────────────────────────────────────────────────────────────────────────── */

export default function OurTeamPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow={ourTeamPage.eyebrow}
        title={ourTeamPage.title}
        lead={ourTeamPage.lead}
        trail={pageTrail("Our Team", "/our-team")}
        aside={
          <HeroPanel title="Leadership">
            <TeamLeadCard person={teamLead} />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink href={ctas.consultation.href} size="lg">
            {ctas.consultation.label}
          </SiteButtonLink>
          <SiteButtonLink href="/how-we-work" variant="secondary" size="lg">
            How we work
          </SiteButtonLink>
        </div>
      </PageHero>

      {/* One band per practice, alternating grounds, in the order the rail
          runs them. Each group's heading is the practice's own name, so a row
          that ends after two cards is a whole group rather than a remainder. */}
      {teamGroups.map((group, i) => (
        <Section
          key={group.id}
          id={group.id}
          tone={i % 2 === 1 ? "surface" : "bg"}
          title={group.label}
          lead={group.blurb}
        >
          <ul className="zan-team-grid">
            {group.people.map((person, n) => (
              <li key={person.id} className="min-w-0">
                <Reveal delay={Math.min(n, 3) * 0.05} className="h-full">
                  <TeamPersonCard person={person} />
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section id="next" eyebrow={labels.process} title="Talk to the people who will build it">
        <Reveal className="flex flex-wrap items-center gap-3">
          <SiteButtonLink href={ctas.consultation.href} size="lg">
            {ctas.consultation.label}
          </SiteButtonLink>
          <SiteButtonLink href="/about-us" variant="secondary" size="lg">
            About the company
          </SiteButtonLink>
        </Reveal>
      </Section>
    </main>
  );
}

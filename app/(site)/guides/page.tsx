import type { Metadata } from "next";
import { PageNotes, UpdatedLine } from "@/components/zan/page/ContentBlocks";
import { PageHero } from "@/components/zan/page/PageHero";
import { Section } from "@/components/zan/page/Section";
import { ServiceCard } from "@/components/zan/page/cards";
import { HeroLinks, HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { pageUpdated } from "@/constants/freshness";
import { guides } from "@/constants/guides";
import { guidesPage, labels, pageTrail, servicePages } from "@/constants/pages";
import { ctas } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { jsonLd, webPageSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: guidesPage.seoTitle,
  description: guidesPage.seoDescription,
  path: "/guides",
});

/* The services the guides support, for the hero's panel, under the names and
   taglines the other panels give them. Each one once, although two guides can
   point at one service. */
const relatedServices = servicePages
  .filter((page) => guides.some((guide) => guide.services.some((service) => service.href === page.href)))
  .map((page) => ({ label: page.title, href: page.href, note: page.tagline }));

/**
 * /guides: every guide, as a card. Reached from /services and from the guides'
 * own trails, and the service pages' copy links to the single guides. The header
 * and the footer do not link here, because a new entry would change how they look.
 */
export default function GuidesPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageSchema({
              path: "/guides",
              name: guidesPage.title.join(" "),
              description: guidesPage.seoDescription,
              type: "CollectionPage",
            }),
          ),
        }}
      />
      <PageHero
        eyebrow={guidesPage.eyebrow}
        title={guidesPage.title}
        lead={guidesPage.lead}
        trail={pageTrail(labels.guides, "/guides")}
        aside={
          <HeroPanel title={labels.relatedServices}>
            <HeroLinks items={relatedServices} />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink href={ctas.consultation.href} size="lg">
            {ctas.consultation.label}
          </SiteButtonLink>{" "}
          <SiteButtonLink href="/services" variant="secondary" size="lg">
            All services
          </SiteButtonLink>
        </div>
      </PageHero>

      <Section id="all-guides" title="All guides">
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide, i) => (
            <li key={guide.slug} className="min-w-0">
              <ServiceCard
                href={`/guides/${guide.slug}`}
                title={guide.title}
                description={guide.summary}
                /* A guide has no photograph, so it takes the glyph of the
                   service it supports. */
                icon={servicePages.find((page) => page.href === guide.services[0]?.href)?.icon}
                delay={Math.min(i, 2) * 0.05}
              />
            </li>
          ))}
        </ul>
      </Section>

      <PageNotes tone="surface">
        <UpdatedLine date={pageUpdated("/guides")} />
      </PageNotes>
    </main>
  );
}

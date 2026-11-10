import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import {
  ContentSections,
  PageNotes,
  sectionAnchor,
  SourcesList,
  UpdatedLine,
} from "@/components/zan/page/ContentBlocks";
import { PageHero } from "@/components/zan/page/PageHero";
import { Section, toneAt } from "@/components/zan/page/Section";
import { ServiceCard } from "@/components/zan/page/cards";
import { HeroLinks, HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { getGuide, guides } from "@/constants/guides";
import { homeCrumb, labels, servicePages } from "@/constants/pages";
import { ctas, faqIntro } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { articleSchema, faqSchema, jsonLd } from "@/lib/schema";

/** Every guide, prerendered. */
export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

/* An unknown slug gets nothing here: the page calls notFound(), and the 404's own
   metadata (app/(site)/not-found.tsx) takes over, as on the service pages. */
export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.seoTitle,
    description: guide.seoDescription,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const path = `/guides/${guide.slug}`;
  /* The bands after the written sections take their ground from where those end. */
  const written = guide.sections.length;
  /* The enquiry form opens on the service this guide supports, as it does from a
     service page. A guide with two lists the likelier one first. */
  const firstService = guide.services[0]?.href;

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            articleSchema({
              path,
              headline: guide.title,
              description: guide.seoDescription,
              datePublished: guide.published,
              dateModified: guide.updated,
              citations: guide.sources.map((source) => source.href),
            }),
            faqSchema(guide.faqs),
          ),
        }}
      />
      <PageHero
        eyebrow={labels.guide}
        title={[guide.title]}
        lead={guide.lead}
        size="h1"
        trail={[homeCrumb, { label: labels.guides, href: "/guides" }, { label: guide.title, href: path }]}
        aside={
          <HeroPanel title={labels.inThisGuide}>
            {/* With the path: SiteLink sends a bare "#…" to the homepage. */}
            <HeroLinks
              items={guide.sections.map((section) => ({
                label: section.heading,
                href: `${path}#${sectionAnchor(section.heading)}`,
              }))}
            />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink
            href={firstService ? `${ctas.consultation.href}?from=${firstService}` : ctas.consultation.href}
            size="lg"
          >
            {ctas.consultation.label}
          </SiteButtonLink>{" "}
          <SiteButtonLink href="/guides" variant="secondary" size="lg">
            All guides
          </SiteButtonLink>
        </div>
      </PageHero>

      <ContentSections sections={guide.sections} />

      <Section id="faq" tone={toneAt(written)} eyebrow={faqIntro.eyebrow} title="Common questions">
        <div className="lg:mx-auto lg:max-w-4xl">
          <FaqAccordion items={guide.faqs} />
        </div>
      </Section>

      <Section id="related-services" tone={toneAt(written + 1)} title={labels.relatedServices}>
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guide.services.map((service, i) => {
            const page = servicePages.find((item) => item.href === service.href);
            return (
              <li key={service.href} className="min-w-0">
                <ServiceCard
                  href={service.href}
                  title={service.label}
                  tagline={page?.tagline}
                  description={page?.description}
                  icon={page?.icon}
                  delay={Math.min(i, 2) * 0.05}
                />
              </li>
            );
          })}
        </ul>
      </Section>

      <PageNotes tone={toneAt(written + 2)}>
        <SourcesList sources={guide.sources} />
        <UpdatedLine path={path} date={guide.updated} />
      </PageNotes>
    </main>
  );
}

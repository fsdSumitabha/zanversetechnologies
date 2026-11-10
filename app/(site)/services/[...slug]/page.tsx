import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import { ContentSections, PageNotes, SourcesList, UpdatedLine } from "@/components/zan/page/ContentBlocks";
import { PageHero, PageHeroPhoto } from "@/components/zan/page/PageHero";
import { ProjectPanel } from "@/components/zan/page/ProjectPanel";
import { Reveal } from "@/components/zan/page/Reveal";
import { Section, toneAt } from "@/components/zan/page/Section";
import { FactCard, ServiceCard, StepCard } from "@/components/zan/page/cards";
import { HeroLinks, HeroList, HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { ButtonLink } from "@/components/zan/ui/Button";
import { pageUpdated } from "@/constants/freshness";
import {
  brandingPackages,
  childrenOf,
  findServicePage,
  homeCrumb,
  labels,
  practiceOf,
  serviceTechDomains,
  servicePages,
  type ServicePage,
} from "@/constants/pages";
import { getServiceHero } from "@/constants/serviceHero";
import { getServiceContent } from "@/constants/services";
import { ctas, faqIntro, faqsForService, processSteps, projects, techDomains } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema, jsonLd, serviceSchema, webPageSchema } from "@/lib/schema";

type RouteParams = { params: Promise<{ slug?: string[] }> };

/** All sixteen service pages: the eight areas and the eight disciplines. */
export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: [...page.segments] }));
}

/* A function rather than an object only because the page comes from the
   slug. The path is the page's own `href`, the same address the sitemap and
   the breadcrumbs give it, so the canonical cannot disagree with either. An
   unknown slug gets nothing here: the page calls notFound(), and the 404's
   own metadata (app/(site)/not-found.tsx) takes over. */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = findServicePage(slug);
  if (!page) return {};
  const content = getServiceContent(page.priceKey);
  return pageMetadata({
    title: content?.seoTitle ?? page.seoTitle,
    description: content?.seoDescription ?? page.seoDescription,
    path: page.href,
  });
}

/** Home / Services / [practice] / this page. */
function trailFor(page: ServicePage) {
  const parent = page.parent ? findServicePage([page.parent]) : undefined;
  return [
    homeCrumb,
    { label: "Services", href: "/services" },
    ...(parent ? [{ label: parent.title, href: parent.href }] : []),
    { label: page.title, href: page.href },
  ];
}

export default async function ServiceDetailPage({ params }: RouteParams) {
  const { slug = [] } = await params;
  const page = findServicePage(slug);
  if (!page) notFound();

  /* The page's words: its h1, its opening, its sections, its questions and its
     sources (constants/services). The short `page.title` stays what the trail
     and the question band call it. */
  const content = getServiceContent(page.priceKey);
  const h1 = content?.h1 ?? page.title;
  const lead = content?.lead ?? page.description;
  const sections = content?.sections ?? [];

  const children = childrenOf(page.slug);
  const isBranding = page.slug === "branding-and-designing";
  const domains = (serviceTechDomains[page.priceKey] ?? [])
    .map((id) => techDomains.find((d) => d.id === id))
    .filter((d) => d !== undefined);
  const relatedWork = projects.filter((p) => p.category === page.priceKey);
  /* One photograph of the work itself under the hero copy. All sixteen pages
     have one; the lookup still returns undefined rather than a placeholder if
     a seventeenth is ever added before its picture is. */
  const hero = getServiceHero(page.priceKey);
  /* The set carried over for three of the sixteen pages, then the questions in
     the page's copy file. Joined here, once, so the accordion and the FAQPage
     markup below are handed the same array and cannot disagree. */
  const faqs = [...(faqsForService[page.priceKey] ?? []), ...(content?.faqs ?? [])];
  const siblings = (practiceOf(page)?.items ?? [])
    .filter((item) => item.href !== page.href)
    .slice(0, 3);

  /* The bands alternate ground, and which ones a page has varies, so each one
     asks where it falls. The copy file's sections come first, straight under the
     hero. */
  const bands = [
    children.length > 0 && "disciplines",
    isBranding && "packages",
    domains.length > 0 && "technology",
    relatedWork.length > 0 && "work",
    "process",
    faqs.length > 0 && "faq",
    siblings.length > 0 && "other-services",
    "notes",
  ].filter(Boolean);
  const toneOf = (band: string) => toneAt(sections.length + bands.indexOf(band));

  /* The hero's right column, in order of what this page actually has: the
     disciplines under it, what it includes, or its siblings. Never a
     decorative panel. */
  const aside =
    children.length > 0 ? (
      <HeroPanel title={labels.disciplines}>
        <HeroLinks items={children.map((c) => ({ label: c.title, href: c.href, note: c.tagline }))} />
      </HeroPanel>
    ) : page.capabilities?.length ? (
      <HeroPanel title={labels.included}>
        <HeroList items={page.capabilities} />
      </HeroPanel>
    ) : siblings.length > 0 ? (
      <HeroPanel title={labels.otherServices}>
        <HeroLinks items={siblings.map((item) => ({ label: item.title, href: item.href, note: item.tagline }))} />
      </HeroPanel>
    ) : undefined;

  return (
    <main id="main">
      {/* What this URL is and when it last changed, what it sells, and the
          questions it answers, with pointers back to the Organization and
          WebSite nodes the layout attaches. `faqSchema` returns null for a page
          with no questions, and `jsonLd` drops it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageSchema({
              path: page.href,
              name: h1,
              description: content?.seoDescription ?? page.seoDescription,
            }),
            serviceSchema(page, { name: h1, description: lead }),
            faqSchema(faqs),
          ),
        }}
      />
      <PageHero
        eyebrow={page.tagline}
        title={[h1]}
        lead={lead}
        trail={trailFor(page)}
        aside={aside}
        media={hero && <PageHeroPhoto photo={hero} />}
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {/* `from` carries this page over to the enquiry form, which lives on
              /contact-us rather than here and would otherwise ask the visitor
              to name the service they have just spent a page reading about. */}
          <SiteButtonLink href={`${ctas.consultation.href}?from=${page.href}`} size="lg">
            {ctas.consultation.label}
          </SiteButtonLink>{" "}
          {/* The branding page is the one page with a deck to jump to. The
              rest send the undecided visitor to the work instead, which is the
              only other thing a service page can offer above the fold. */}
          {isBranding ? (
            <ButtonLink href="#packages" variant="secondary" size="lg" arrow={false}>
              See the packages
            </ButtonLink>
          ) : (
            <SiteButtonLink href={ctas.portfolio.href} variant="secondary" size="lg">
              {ctas.portfolio.label}
            </SiteButtonLink>
          )}
        </div>
      </PageHero>

      <ContentSections sections={sections} />

      {children.length > 0 && (
        <Section
          id="disciplines"
          tone={toneOf("disciplines")}
          eyebrow={labels.disciplines}
          title="Sold as separate disciplines"
          lead="Each has its own page, with what the work covers and how it is run."
        >
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {children.map((child, i) => (
              <li key={child.slug} className="min-w-0">
                <ServiceCard
                  href={child.href}
                  title={child.title}
                  tagline={child.tagline}
                  description={child.description}
                  icon={child.icon}
                  delay={Math.min(i, 3) * 0.05}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* #packages is where the hero's "See the packages" button lands, so the
          id is an address and stays as it is. */}
      {isBranding && (
        <Section
          id="packages"
          tone={toneOf("packages")}
          eyebrow={labels.packages}
          title="Three branding decks"
          lead="Buy a discipline on its own, or take one of these. Each deck is quoted against its scope after the discovery call."
        >
          <ul className="grid gap-5 md:grid-cols-3">
            {brandingPackages.map((pkg, i) => (
              <li key={pkg.key} className="min-w-0">
                <FactCard
                  title={pkg.title}
                  tagline={pkg.tagline}
                  description={pkg.description}
                  delay={Math.min(i, 2) * 0.05}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {domains.length > 0 && (
        <Section id="technology" tone={toneOf("technology")} eyebrow={labels.technology} title="What we build it with">
          <div className="grid gap-5 md:grid-cols-2">
            {domains.map((domain, i) => (
              <Reveal key={domain.id} delay={Math.min(i, 3) * 0.05} className="h-full">
                <div className="h-full rounded-3xl border border-border bg-surface p-6 sm:p-7">
                  <h3 className="font-display text-h3 font-semibold text-foreground">{domain.label}</h3>
                  <p className="mt-3 text-body text-muted">{domain.blurb}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {domain.stack.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[0.8125rem] leading-none text-muted"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {relatedWork.length > 0 && (
        <Section
          id="work"
          tone={toneOf("work")}
          eyebrow={labels.relatedWork}
          title={relatedWork.length > 1 ? "Projects in this discipline" : "A project in this discipline"}
          aside={
            <SiteButtonLink href={ctas.portfolio.href} variant="secondary">
              {ctas.portfolio.label}
            </SiteButtonLink>
          }
        >
          <div className="space-y-14 sm:space-y-16">
            {relatedWork.map((project, i) => (
              <ProjectPanel key={project.id} project={project} flip={i % 2 === 1} />
            ))}
          </div>
        </Section>
      )}

      <Section
        id="process"
        tone={toneOf("process")}
        eyebrow={labels.process}
        title="Four steps, start to launch"
        aside={
          <SiteButtonLink href="/how-we-work" variant="secondary">
            How we work
          </SiteButtonLink>
        }
      >
        <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, i) => (
            <li key={step.id} className="min-w-0">
              <StepCard
                index={step.index}
                title={step.title}
                description={step.description}
                deliverables={[]}
                delay={Math.min(i, 3) * 0.05}
              />
            </li>
          ))}
        </ol>
      </Section>

      {faqs.length > 0 && (
        <Section
          id="faq"
          tone={toneOf("faq")}
          eyebrow={faqIntro.eyebrow}
          title={`${page.title} questions`}
          lead="Common questions about this work, answered in full."
        >
          <div className="lg:mx-auto lg:max-w-4xl">
            <FaqAccordion items={faqs} />
          </div>
        </Section>
      )}

      {siblings.length > 0 && (
        <Section
          id="other-services"
          tone={toneOf("other-services")}
          eyebrow={labels.otherServices}
          title="Also in this practice"
        >
          <ul className="grid gap-5 md:grid-cols-3">
            {siblings.map((item, i) => (
              <li key={item.id} className="min-w-0">
                <ServiceCard
                  href={item.href}
                  title={item.title}
                  tagline={item.tagline}
                  description={item.description}
                  icon={item.icon}
                  delay={Math.min(i, 2) * 0.05}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <PageNotes tone={toneOf("notes")}>
        <SourcesList sources={content?.sources} />
        <UpdatedLine date={pageUpdated(page.href)} />
      </PageNotes>
    </main>
  );
}

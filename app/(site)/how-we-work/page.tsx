import type { Metadata } from "next";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import { PageNotes, UpdatedLine } from "@/components/zan/page/ContentBlocks";
import { PageHero } from "@/components/zan/page/PageHero";
import { Reveal } from "@/components/zan/page/Reveal";
import { Section } from "@/components/zan/page/Section";
import { FactCard, StepCard } from "@/components/zan/page/cards";
import { HeroFacts, HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { howWeWorkFaqs } from "@/constants/pageFaqs";
import { howWeWorkPage, labels, pageTrail } from "@/constants/pages";
import { getReasonArt } from "@/constants/serviceArt";
import { about, ctas, faqIntro, processSteps, techDomains, techIntro, whyUs } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema, howToSchema, jsonLd, webPageSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: howWeWorkPage.seoTitle,
  description: howWeWorkPage.seoDescription,
  path: "/how-we-work",
});

export default function HowWeWorkPage() {
  return (
    <main id="main">
      {/* What this URL is, the four steps it renders, as a HowTo (the one page
          on the site whose whole content is a procedure), and the questions the
          #faq band renders, from the same array. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageSchema({
              path: "/how-we-work",
              name: howWeWorkPage.title.join(" "),
              description: howWeWorkPage.seoDescription,
            }),
            howToSchema(),
            faqSchema(howWeWorkFaqs),
          ),
        }}
      />
      <PageHero
        eyebrow={howWeWorkPage.eyebrow}
        title={howWeWorkPage.title}
        lead={howWeWorkPage.lead}
        trail={pageTrail("How We Work", "/how-we-work")}
        aside={
          <HeroPanel title="The engagement">
            <HeroFacts items={about.principles} />
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

      <Section
        id="process"
        eyebrow="The four steps"
        title="What happens, in order"
        lead="Every project runs the same way, whether it is a landing page or a platform. What changes is how long each step takes."
      >
        <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, i) => (
            <li key={step.id} className="min-w-0">
              {/* The id is the address each step in the HowTo markup links to. */}
              <StepCard
                id={step.id}
                index={step.index}
                title={step.title}
                description={step.description}
                deliverables={step.deliverables}
                delay={Math.min(i, 3) * 0.05}
              />
            </li>
          ))}
        </ol>
      </Section>

      <Section id="why-us" tone="surface" eyebrow={whyUs.eyebrow} title={whyUs.title.join(" ")}>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {whyUs.items.map((item, i) => (
            <li key={item.id} className="min-w-0">
              <FactCard
                index={item.index}
                title={item.title}
                tagline={item.tagline}
                description={item.description}
                icon={item.icon}
                art={getReasonArt(item.id)}
                delay={Math.min(i, 3) * 0.05}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="technology" eyebrow={techIntro.eyebrow} title={techIntro.title.join(" ")} lead={techIntro.lead}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {techDomains.map((domain, i) => (
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

      <Section id="engagement" tone="surface" eyebrow={labels.atAGlance} title="Who you talk to">
        <Reveal>
          <p className="max-w-[62ch] text-lead text-muted">{about.body[1]}</p>
        </Reveal>
      </Section>

      <Section
        id="faq"
        eyebrow={faqIntro.eyebrow}
        title="Questions about how we work"
        lead="How long a project takes, how you see progress, how it is paid for and what comes after launch."
      >
        <div className="lg:mx-auto lg:max-w-4xl">
          <FaqAccordion items={howWeWorkFaqs} />
        </div>
      </Section>

      <PageNotes tone="surface">
        <UpdatedLine path="/how-we-work" />
      </PageNotes>
    </main>
  );
}

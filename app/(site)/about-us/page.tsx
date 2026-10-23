import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/zan/page/PageHero";
import { Reveal } from "@/components/zan/page/Reveal";
import { Section } from "@/components/zan/page/Section";
import { FactCard, FactList, MetricRow } from "@/components/zan/page/cards";
import { HeroFacts, HeroPanel } from "@/components/zan/page/HeroPanel";
import { OfficeCards } from "@/components/zan/contact/OfficeCard";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { aboutPage, labels, pageTrail } from "@/constants/pages";
import { getIndustryArt } from "@/constants/serviceArt";
import {
  about,
  credentials,
  credentialsIntro,
  ctas,
  industries,
  industriesIntro,
  metrics,
  metricsIntro,
  office,
  site,
} from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: aboutPage.seoTitle,
  description: aboutPage.seoDescription,
  path: "/about-us",
});

/* No Organization node of its own: app/(site)/layout.tsx attaches the full
   one (lib/schema.ts `organizationSchema`) to every page, this one included,
   with the same address, number and certificates this page shows. */

/**
 * How to reach the office, beside its card. The card carries the address,
 * the number and the local time; these are the rest of what a buyer asks
 * before the first call, each one said elsewhere on the site already (the
 * FAQ answers on working with a UAE client and on where the company is).
 */
const reachUs = [
  { label: "Phone & WhatsApp", value: office.phoneDisplay, href: `tel:${office.phoneTel}` },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Meetings", value: "Video calls, or in Dubai by arrangement" },
  { label: "Agreements", value: "NDAs and IP assignment under your jurisdiction" },
] as const;

export default function AboutPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow={about.eyebrow}
        title={about.heading}
        lead={about.body[0]}
        size="h1"
        trail={pageTrail("About Us", "/about-us")}
        aside={
          <HeroPanel title="The company">
            <HeroFacts items={about.principles} />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink href={ctas.contact.href} size="lg">
            {ctas.contact.label}
          </SiteButtonLink>
          <SiteButtonLink href={ctas.portfolio.href} variant="secondary" size="lg">
            {ctas.portfolio.label}
          </SiteButtonLink>
        </div>
      </PageHero>

      <Section id="how-we-engage" eyebrow={metricsIntro.eyebrow} title="How we work with you">
        <Reveal>
          <p className="max-w-[62ch] text-lead text-ink-2">{about.body[1]}</p>
        </Reveal>
        <MetricRow items={metrics} className="mt-10" />
      </Section>

      {/* ── Credentials ───────────────────────────────────────────────────
          The certificates a buyer checks a supplier against. Plain light
          cards, the numbers as selectable text, and the brand colour only on
          the reference line. Two of them, so two columns: from lg each card
          turns on its side, mark on the left, so a pair across the full
          width reads as a pair rather than as two cards stretched to fill a
          row. The footer's "/about-us#credentials" lands here. */}
      <Section
        id="credentials"
        tone="surface"
        eyebrow={credentialsIntro.eyebrow}
        title={credentialsIntro.title}
        lead={credentialsIntro.lead}
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          {credentials.map((c, i) => (
            <li key={c.id} className="min-w-0">
              <Reveal delay={Math.min(i, 3) * 0.05} className="h-full">
                <article className="flex h-full flex-col gap-5 rounded-3xl border border-line bg-bg p-6 sm:p-7 lg:flex-row lg:gap-7">
                  <div
                    className={cn(
                      "grid h-20 shrink-0 place-items-center rounded-2xl px-5 lg:h-auto lg:w-36 lg:px-0",
                      c.onDark ? "bg-ink" : "bg-surface",
                    )}
                  >
                    <Image
                      src={c.logo.src}
                      alt={c.logo.alt}
                      width={c.logo.width}
                      height={c.logo.height}
                      sizes="160px"
                      /* A vector mark skips the optimizer, which refuses SVG
                         without dangerouslyAllowSVG and has nothing to gain
                         from it anyway. Today's two marks are raster. */
                      unoptimized={c.logo.src.endsWith(".svg")}
                      className="max-h-12 w-auto object-contain lg:max-h-20"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display text-h3 font-semibold text-ink">{c.name}</h3>
                    <p className="mt-2 text-small text-ink-2">{c.body}</p>
                    {/* mt-auto lines the two reference rows up along one
                        baseline; the padding keeps a gap above the rule on
                        the card whose copy runs longest. */}
                    <div className="mt-auto pt-5 md:pt-6">
                      <dl className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-5 md:pt-6">
                        <dt className="font-mono text-eyebrow text-muted uppercase">{c.refLabel}</dt>
                        <dd className="font-mono text-small font-medium text-brand-ink tabular-nums">{c.ref}</dd>
                      </dl>
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── The office ────────────────────────────────────────────────────
          One office, so one card, given half the band rather than a third of
          a grid: the card on the left with its address, number and local
          time, and beside it the rest of what a buyer asks before calling. */}
      <Section
        id="office"
        eyebrow={labels.offices}
        title="Where to find us"
        lead="IFZA Business Park, in Dubai Silicon Oasis. The office answers calls and WhatsApp on a UAE number, and every enquiry gets a reply within 24 hours."
      >
        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-5">
            <OfficeCards />
          </div>
          <Reveal delay={0.05} className="min-w-0 lg:col-span-7">
            <FactList items={reachUs} />
          </Reveal>
        </div>
      </Section>

      <Section
        id="industries"
        tone="surface"
        eyebrow={industriesIntro.eyebrow}
        title={industriesIntro.title.join(" ")}
        lead={industriesIntro.lead}
      >
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {industries.map((industry, i) => (
            <li key={industry.id} className="min-w-0">
              <FactCard
                title={industry.label}
                description={industry.description}
                icon={industry.icon}
                art={getIndustryArt(industry.id)}
                delay={Math.min(i, 3) * 0.05}
              />
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}

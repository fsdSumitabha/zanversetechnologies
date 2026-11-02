import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientStrip } from "@/components/zan/landing/ClientStrip";
import { Closing } from "@/components/zan/landing/Closing";
import { Faq } from "@/components/zan/landing/Faq";
import { LandingFooter } from "@/components/zan/landing/LandingFooter";
import { LandingHero } from "@/components/zan/landing/LandingHero";
import { LandingNav } from "@/components/zan/landing/LandingNav";
import { NextSteps } from "@/components/zan/landing/NextSteps";
import { Packages } from "@/components/zan/landing/Packages";
import { Process } from "@/components/zan/landing/Process";
import { QuoteProvider } from "@/components/zan/landing/QuoteProvider";
import { WhyUs } from "@/components/zan/landing/WhyUs";
import { Work } from "@/components/zan/landing/Work";
import { landingPageBySlug, landingPages, landingPath } from "@/constants/landing";
import { pageMetadata } from "@/lib/metadata";

type RouteParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return landingPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const page = landingPageBySlug(slug);
  if (!page) return {};
  return {
    ...pageMetadata({
      title: page.seo.title,
      description: page.seo.description,
      path: landingPath(page.slug),
      absoluteTitle: true,
    }),
    // No canonical on a page that asks not to be indexed: a canonical is a claim
    // that this is the one to rank. The layout sets the noindex.
    alternates: null,
  };
}

/**
 * One layout, every landing page: `constants/landing.ts` is the only thing that
 * differs between them. The sections run in the order a paid visitor is walked
 * through: the ask first, then what happens next, who else trusts us, what can
 * be bought, why us, how it runs, the proof, the objections, and the ask again.
 */
export default async function LandingPageRoute({ params }: RouteParams) {
  const { slug } = await params;
  const page = landingPageBySlug(slug);
  if (!page) notFound();

  return (
    <QuoteProvider
      page={{
        slug: page.slug,
        label: page.label,
        service: page.service,
        packages: page.decks.map((deck) => ({
          label: page.decks.length > 1 ? deck.label : undefined,
          titles: deck.packages.map((p) => p.title),
        })),
      }}
    >
      <LandingNav />
      <main id="main">
        <LandingHero page={page} />
        <NextSteps page={page} />
        <ClientStrip />
        <Packages page={page} />
        <WhyUs />
        <Process />
        <Work page={page} />
        <Faq page={page} />
        <Closing page={page} />
      </main>
      <LandingFooter />
    </QuoteProvider>
  );
}

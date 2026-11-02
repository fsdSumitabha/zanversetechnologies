import type { Metadata } from "next";
import { HeroLinks, HeroPanel } from "@/components/zan/page/HeroPanel";
import { PageHero } from "@/components/zan/page/PageHero";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { landingCopy, landingPages, landingPath } from "@/constants/landing";
import { site } from "@/constants/zan";

export const metadata: Metadata = {
  title: { absolute: `${landingCopy.notFound.title.join(" ")} — ${site.name}` },
};

/**
 * A retired or mistyped campaign link. Someone paid for this click, so it offers
 * the pages that do exist before it offers the way out.
 */
export default function LandingNotFound() {
  const { notFound } = landingCopy;
  return (
    <main id="main">
      <header className="absolute inset-x-0 top-0 z-10 flex h-nav items-center">
        <div className="container-zan">
          <ZanLogo eager className="h-7 sm:h-8" />
        </div>
      </header>
      <PageHero
        eyebrow={notFound.eyebrow}
        title={notFound.title}
        lead={notFound.lead}
        aside={
          <HeroPanel title="Our services">
            <HeroLinks items={landingPages.map((p) => ({ label: p.label, href: landingPath(p.slug) }))} />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink href="/" size="lg">
            {landingCopy.footer.mainSite}
          </SiteButtonLink>
        </div>
      </PageHero>
    </main>
  );
}

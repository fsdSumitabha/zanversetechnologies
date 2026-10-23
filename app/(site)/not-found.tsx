import type { Metadata } from "next";
import { PageHero } from "@/components/zan/page/PageHero";
import { HeroLinks, HeroPanel } from "@/components/zan/page/HeroPanel";
import { SiteButtonLink } from "@/components/zan/services/SiteLinks";
import { notFoundPage } from "@/constants/pages";
import { ctas, footerColumns } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";

/* The same title and share card as every other page, minus the two fields
   that name an address. A URL that does not exist has no canonical to claim,
   and an og:url would claim one anyway, so both are taken back out of what
   pageMetadata builds. The 404 status itself makes Next add the noindex. */
const shared = pageMetadata({
  title: notFoundPage.seoTitle,
  description: "The page you asked for is not on this site.",
  path: "/",
});

export const metadata: Metadata = {
  ...shared,
  alternates: null,
  openGraph: { ...shared.openGraph, url: null },
};

/** The footer's Company column, which is where a lost visitor usually meant to go. */
const company = footerColumns.find((c) => c.title === "Company")?.links ?? [];

export default function NotFound() {
  return (
    <main id="main">
      <PageHero
        eyebrow={notFoundPage.eyebrow}
        title={notFoundPage.title}
        lead={notFoundPage.lead}
        aside={
          <HeroPanel title="Pages people usually want">
            <HeroLinks items={[{ label: "Services", href: "/services" }, ...company]} />
          </HeroPanel>
        }
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <SiteButtonLink href="/" size="lg">
            Back to the homepage
          </SiteButtonLink>
          <SiteButtonLink href={ctas.contact.href} variant="secondary" size="lg">
            {ctas.contact.label}
          </SiteButtonLink>
        </div>
      </PageHero>
    </main>
  );
}

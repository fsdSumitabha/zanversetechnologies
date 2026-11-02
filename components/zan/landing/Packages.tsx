import { Fragment } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/zan/page/Reveal";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { landingCopy, type LandingPackage, type LandingPage } from "@/constants/landing";
import { PackageArt } from "./PackageArt";
import { PackageTabs } from "./PackageTabs";
import { QuoteButton } from "./QuoteButton";

function PackageCard({ item }: { item: LandingPackage }) {
  const copy = landingCopy.packages;
  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-bg transition-[border-color,box-shadow,translate] duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-strong hover:shadow-float">
      <div className="zan-lp-board relative aspect-[16/9] border-b border-line bg-surface">
        <PackageArt name={item.art} />
        {item.popular && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-soft px-2.5 py-1.5 font-mono text-[0.625rem] leading-none tracking-[0.16em] text-brand-ink uppercase">
            {copy.popular}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-h3 font-semibold text-ink">{item.title}</h3>
        <p className="mt-2.5 text-small text-ink-2">{item.description}</p>

        <ul className="mt-5 space-y-2 border-t border-line pt-5">
          {item.includes.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-small text-ink">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-ink" strokeWidth={2.2} />
              {line}
            </li>
          ))}
        </ul>

        {/* mt-auto, so the row of cards lines its buttons up along one baseline. */}
        <div className="mt-auto pt-6">
          <QuoteButton location="package_card" interest={item.title} variant="secondary" className="w-full">
            {copy.action}
            <span className="sr-only">: {item.title}</span>
          </QuoteButton>
        </div>
      </div>
    </article>
  );
}

function PackageGrid({ items }: { items: readonly LandingPackage[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => (
        <li key={item.title} className="min-w-0">
          <Reveal delay={i * 0.06} className="h-full">
            <PackageCard item={item} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/**
 * What can be bought. No prices: each card says what it includes, and its button
 * opens the form already set to that package, so the visitor does not have to
 * name again the thing they have just chosen.
 *
 * A page that sells several groups shows one at a time. Someone buying paid media
 * has no use for twelve cards about everything else, and on a phone sixteen cards
 * in a row would be nine thousand pixels between them and the rest of the page.
 */
export function Packages({ page }: { page: LandingPage }) {
  return (
    <section id="services" className="scroll-mt-nav bg-bg py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan">
        <SectionHeading
          eyebrow={landingCopy.packages.eyebrow}
          title={page.packagesIntro.title}
          lead={page.packagesIntro.lead}
          size="h1"
          accentLine={1}
        />

        {page.decks.length > 1 ? (
          <PackageTabs
            label={`${page.label} services`}
            tabs={page.decks.map(({ label, covers }) => ({ label, covers }))}
            panels={page.decks.map((deck) => (
              <Fragment key={deck.label}>
                {deck.intro && (
                  <div className="mb-8">
                    <p className="font-mono text-eyebrow text-brand-ink uppercase">{deck.intro.tagline}</p>
                    <p className="mt-3 max-w-[70ch] text-body text-ink-2">{deck.intro.description}</p>
                  </div>
                )}
                <PackageGrid items={deck.packages} />
              </Fragment>
            ))}
          />
        ) : (
          <div className="mt-10 sm:mt-12">
            <PackageGrid items={page.decks[0].packages} />
          </div>
        )}
      </div>
    </section>
  );
}

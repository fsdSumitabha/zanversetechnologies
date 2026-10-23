import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHero } from "@/components/zan/page/PageHero";
import { Reveal } from "@/components/zan/page/Reveal";
import { HeroLinks, HeroPanel } from "@/components/zan/page/HeroPanel";
import { legalIntro, legalSlugs, type LegalSlug } from "@/constants/pages";
import { legalDocuments, type LegalBlock } from "@/constants/legal";
import { credits, office, site } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";

/** Title, description and canonical for a policy page, so the five routes stay one-liners. */
export function legalMetadata(slug: LegalSlug): Metadata {
  return pageMetadata({
    title: legalDocuments[slug].title,
    description: `${legalDocuments[slug].title} for ${site.name}. ${legalIntro[slug]}`,
    path: `/${slug}`,
  });
}

/**
 * The inbox and the Dubai office's number, as links.
 *
 * The documents store these two lines as `contact` blocks with no text of
 * their own (constants/legal.ts), so the address and the number are read from
 * constants/zan.ts here: a second copy of a published phone number in the
 * policy text is exactly the kind that goes stale.
 *
 * The prefixes the stored text used to carry ("Email: ", "Phone: ") are gone:
 * a mailto: and a tel: link say the same thing.
 */
function contactLink(kind: "email" | "phone") {
  const [href, label] =
    kind === "email"
      ? [`mailto:${site.email}`, site.email]
      : [`tel:${office.phoneTel}`, office.phoneDisplay];
  return (
    <a
      href={href}
      className="underline decoration-line-strong underline-offset-2 transition-colors duration-300 hover:text-ink"
    >
      {label}
    </a>
  );
}

/**
 * Runs of consecutive `li` blocks become one list. The documents are stored
 * flat (see constants/legal.ts), and a bullet on its own would otherwise lose
 * both its list semantics and its indent.
 */
function group(blocks: readonly LegalBlock[]): ReactNode[] {
  const out: ReactNode[] = [];
  let bullets: ReactNode[] = [];

  const flush = () => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul-${out.length}`} className="mt-4 space-y-2.5 text-body text-ink-2">
        {bullets.map((node, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand" />
            <span>{node}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  for (const block of blocks) {
    if (block.contact) {
      bullets.push(contactLink(block.contact));
      continue;
    }
    const { text } = block;
    if (block.tag === "li") {
      bullets.push(text);
      continue;
    }
    flush();
    if (block.tag === "h2") {
      out.push(
        <h2 key={out.length} className="mt-14 font-display text-h2 text-balance text-ink first:mt-0">
          {text}
        </h2>,
      );
    } else if (block.tag === "h3") {
      out.push(
        <h3 key={out.length} className="mt-9 font-display text-h3 font-semibold text-ink">
          {text}
        </h3>,
      );
    } else if (block.tag === "h4") {
      out.push(
        <h4 key={out.length} className="mt-7 font-mono text-eyebrow text-muted uppercase">
          {text}
        </h4>,
      );
    } else {
      out.push(
        <p key={out.length} className="mt-4 text-body text-ink-2">
          {text}
        </p>,
      );
    }
  }
  flush();
  return out;
}

/**
 * One of the five policies. The text is legally operative and is rendered
 * exactly as it is stored: this component only decides the typography. It
 * reads nothing from the request, so all five pages prerender.
 */
export function LegalDocumentView({ slug }: { slug: LegalSlug }) {
  const doc = legalDocuments[slug];
  return (
    <main id="main">
      <PageHero
        eyebrow="Legal"
        title={[doc.title]}
        lead={legalIntro[slug]}
        trail={[
          { label: "Home", href: "/" },
          { label: doc.title, href: `/${slug}` },
        ]}
        aside={
          <HeroPanel title="The other policies">
            <HeroLinks
              items={legalSlugs
                .filter((s) => s !== slug)
                .map((s) => ({ label: legalDocuments[s].title, href: `/${s}`, note: legalIntro[s] }))}
            />
          </HeroPanel>
        }
      >
        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-line-strong bg-bg px-4 py-2 text-small text-ink-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          Effective {doc.effective}
        </p>
      </PageHero>

      <section className="border-t border-line bg-bg py-[clamp(3.5rem,2.6rem+3.8vw,6rem)]">
        <div className="container-zan">
          <Reveal className="max-w-[72ch]">{group(doc.blocks)}</Reveal>
        </div>
      </section>

      {/* The CC BY 4.0 licence on the 3D laptop asks for a credit wherever the
          work is used. It lives here rather than in the footer of every page:
          one quiet, findable place, outside the legally operative text above. */}
      {slug === "disclaimer" && credits.length > 0 && (
        <section className="border-t border-line bg-surface py-[clamp(2.5rem,2rem+2vw,4rem)]">
          <div className="container-zan">
            <div className="max-w-[72ch]">
              <h2 className="font-mono text-eyebrow text-muted uppercase">Third-party credits</h2>
              <ul className="mt-4 space-y-2.5 text-small text-ink-2">
                {credits.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener"
                      className="underline decoration-line-strong underline-offset-2 transition-colors duration-300 hover:text-ink"
                    >
                      {c.work}
                    </a>{" "}
                    by {c.author}, licensed{" "}
                    <a
                      href={c.licenseHref}
                      target="_blank"
                      rel="noopener"
                      className="whitespace-nowrap underline decoration-line-strong underline-offset-2 transition-colors duration-300 hover:text-ink"
                    >
                      {c.license}
                    </a>
                    .
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

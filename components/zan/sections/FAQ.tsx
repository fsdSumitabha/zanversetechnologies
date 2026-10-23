import { faqIntro, faqs } from "@/constants/zan";
import { faqSchema, jsonLd } from "@/lib/schema";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import { FaqAside } from "@/components/zan/contact/FaqAside";

/**
 * The homepage's questions, and the only FAQPage node for them: /contact-us
 * shows the same questions without markup, deliberately (see the note there).
 *
 * A plain server component. The questions are constants, so nothing here
 * waits on the request and the section renders with the rest of the static
 * page.
 *
 * The one `faqs` array is handed to the accordion and to faqSchema() alike,
 * which is what keeps the FAQPage markup from claiming an answer the page does
 * not show. lib/schema.ts owns the FAQPage shape for every question set on the
 * site, so it owns this one too.
 */
export function FAQ() {
  return (
    <section id="faq" className="relative scroll-mt-nav border-t border-line bg-bg py-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faqs)) }} />
      <div className="container-zan grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+3rem)]">
            <SectionHeading eyebrow={faqIntro.eyebrow} title={faqIntro.title} size="h1" />
            <FaqAside />
          </div>
        </div>
        <div className="lg:col-span-7">
          <FaqAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
}

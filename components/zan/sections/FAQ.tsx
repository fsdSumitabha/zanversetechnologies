import { faqIntro, faqs } from "@/constants/zan";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import { FaqAside } from "@/components/zan/contact/FaqAside";

/**
 * The homepage's questions. Their FAQPage node is at the top of <main> in
 * app/(site)/page.tsx, so a reader that stops partway through a long page still
 * gets it. It is the only one for them: /contact-us shows the same questions
 * without markup, deliberately (see the note there).
 *
 * A plain server component. The questions are constants, so nothing here
 * waits on the request and the section renders with the rest of the static
 * page.
 *
 * The one `faqs` array is handed to this accordion and to faqSchema() alike,
 * which is what keeps the FAQPage markup from claiming an answer the page does
 * not show.
 */
export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative scroll-mt-nav border-t border-border bg-canvas py-section">
      <div className="container-zan grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+3rem)]">
            <SectionHeading id="faq-heading" eyebrow={faqIntro.eyebrow} title={faqIntro.title} size="h1" />
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

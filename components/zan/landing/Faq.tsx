import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { landingCopy, splitFaqs, type LandingPage } from "@/constants/landing";
import { LandingFaq } from "./LandingFaq";

export function Faq({ page }: { page: LandingPage }) {
  const { faq } = landingCopy;
  return (
    <section id="faq" className="scroll-mt-nav border-t border-border bg-surface-muted py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan">
        <SectionHeading
          eyebrow={faq.eyebrow}
          title={faq.title}
          lead={faq.lead(page.label.toLowerCase())}
          size="h1"
          accentLine={1}
          className="mb-10 sm:mb-12"
        />
        <LandingFaq faqs={splitFaqs(page)} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/zan/page/PageHero";
import { Section } from "@/components/zan/page/Section";
import { ContactDirect } from "@/components/zan/contact/ContactDirect";
import { EnquiryForm } from "@/components/zan/contact/EnquiryForm";
import { FaqAccordion } from "@/components/zan/contact/FaqAccordion";
import { OfficeCards } from "@/components/zan/contact/OfficeCard";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { HeroPanel } from "@/components/zan/page/HeroPanel";
import { contactPage, labels, pageTrail } from "@/constants/pages";
import { faqIntro, faqs, site } from "@/constants/zan";
import { pageMetadata } from "@/lib/metadata";
import { serviceFromPath } from "@/lib/services";

export const metadata: Metadata = pageMetadata({
  title: contactPage.seoTitle,
  description: contactPage.seoDescription,
  path: "/contact-us",
});

/* NO FAQPage MARKUP HERE — deliberately.

   This page renders the same questions as the homepage, and marking them up
   here as well would give Google two byte-for-byte identical FAQPage nodes on
   two URLs of one site: it keeps one and discards the other, and the one it
   keeps is not reliably the homepage, which is the URL that should rank for
   them. The markup lives on / (components/zan/sections/FAQ.tsx). The
   accordion below renders in full all the same — this is a markup decision,
   not a content one. */

export default async function ContactPage({ searchParams }: PageProps<"/contact-us">) {
  /* A service page's "Get Free Consultation" arrives as
     /contact-us?from=/services/web-development. Resolved here, on the server,
     so the enquiry form opens on the right service in the HTML itself rather
     than correcting itself after hydration. It is the one thing on this page
     that reads the request, which is why this page renders per request when
     the rest of the site prerenders. */
  const { from } = await searchParams;
  const service = serviceFromPath(typeof from === "string" ? from : undefined);

  return (
    <main id="main">
      <PageHero
        eyebrow={contactPage.eyebrow}
        title={contactPage.title}
        lead={contactPage.lead}
        trail={pageTrail("Contact Us", "/contact-us")}
        aside={
          <HeroPanel title="Talk to us directly">
            <ContactDirect className="flex-col items-stretch justify-start gap-3" />
            <p className="mt-6 border-t border-line pt-5 text-small text-muted">
              The Dubai office answers this number on calls and on WhatsApp. Every enquiry is answered within 24 hours.
            </p>
          </HeroPanel>
        }
      />

      <Section id="enquiry">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <EnquiryForm defaultService={service} />
          </div>
          <div className="lg:col-span-5">
            {/* The form is the longer column, so it is the office that keeps
                pace: the card, with its number and local time, stays in view
                beside the form while it is filled in. Grid items stretch to
                the row, which is what gives the sticky block room to travel. */}
            <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)]">
              <Eyebrow>{labels.offices}</Eyebrow>
              <OfficeCards className="mt-5" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="faq" tone="surface" eyebrow={faqIntro.eyebrow} title={faqIntro.title.join(" ")}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-lead text-ink-2">
              Still unsure what you need? Write to{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:text-brand-ink hover:decoration-current"
              >
                {site.email}
              </a>{" "}
              and describe the problem in a paragraph. We answer every enquiry within 24 hours.
            </p>
          </div>
          <div className="lg:col-span-8">
            {/* The homepage's set, unmarked here: see the note above. */}
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </Section>
    </main>
  );
}

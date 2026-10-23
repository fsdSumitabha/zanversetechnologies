import { about, contactIntro } from "@/constants/zan";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { ContactRays } from "@/components/zan/contact/ContactRays";
import { ContactDirect } from "@/components/zan/contact/ContactDirect";
import { EnquiryForm } from "@/components/zan/contact/EnquiryForm";
import { OfficeCards } from "@/components/zan/contact/OfficeCard";

/**
 * The page's last word: brand light over the heading, the Dubai number and
 * the inbox, then the enquiry form with the office beside it.
 *
 * There is one office, so the column beside the form is composed around one
 * card rather than a stack of them. The form is the taller of the two, so it
 * is the office that sticks: its card rides beside the form for as long as the
 * form is on screen, and the address and the UAE number stay a glance away the
 * whole time someone is writing. Below 1024px the office follows the form.
 */
export function Contact() {
  return (
    // overflow-clip, not hidden: `hidden` makes the section a scroll container
    // and the office card beside the form would stop sticking.
    <section id="contact" className="relative isolate scroll-mt-nav overflow-clip border-t border-line bg-surface py-section">
      <ContactRays />

      <div className="container-zan relative">
        <SectionHeading
          eyebrow={contactIntro.eyebrow}
          title={contactIntro.title}
          lead={contactIntro.lead}
          align="center"
          size="display"
        />
        <ContactDirect className="mt-9" />

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
          {/* The column stretches to the form's height: that is the run the
              office card has to travel in. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)]">
              <Eyebrow>{about.principles[1].label}</Eyebrow>
              <OfficeCards className="mt-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

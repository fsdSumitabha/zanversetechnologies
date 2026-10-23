import { contactIntro } from "@/constants/zan";
import { emailjsReady } from "@/lib/emailjs";
import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { ContactRays } from "@/components/zan/contact/ContactRays";
import { ContactDirect } from "@/components/zan/contact/ContactDirect";
import { EnquiryForm } from "@/components/zan/contact/EnquiryForm";
import { OfficeCards } from "@/components/zan/contact/OfficeCard";

/**
 * The page's last word: brand light over the heading, the Dubai number and
 * the inbox, then the enquiry form with the office beside it.
 *
 * The form and the office card start and end level, so they read as one row
 * rather than a short card beside a tall one. The form, the main action, takes
 * seven columns and stretches to the office card's height (`fill`: its
 * project-details box takes the slack). The office card names its own country
 * and city, so no eyebrow sits over it to push it below the form. When the
 * form runs longer (its error messages), the office card sticks beside it, so
 * the address and the UAE number stay a glance away. Below 1024px the office
 * follows the form.
 *
 * Without EmailJS credentials there is no form (EnquiryForm explains why). The
 * call and the inbox are already the two buttons above, so the office card
 * then stands alone, centred, instead of beside a short card repeating them.
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

        {emailjsReady ? (
          <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <EnquiryForm fill />
            </div>
            {/* The column stretches to the row: the run the office card has to
                travel in when the form is the taller of the two. */}
            <div className="lg:col-span-5">
              <OfficeCards className="lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)]" />
            </div>
          </div>
        ) : (
          <OfficeCards className="mx-auto mt-16 max-w-lg lg:mt-24" />
        )}
      </div>
    </section>
  );
}

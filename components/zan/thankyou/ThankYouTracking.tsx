"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { site } from "@/constants/zan";
import { ButtonLink } from "@/components/zan/ui/Button";
import { takeLead, trackGenerateLead, trackWhatsAppClick } from "@/lib/analytics";
import { waLink } from "@/lib/links";

const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

/**
 * The conversion.
 *
 * A lead the forms' script has just sent is what Google Ads counts here. The
 * event carries the address and number the visitor gave, which the tag hashes
 * before they leave the browser; that is what Enhanced Conversions matches
 * against the click that brought them here.
 *
 * The details come from sessionStorage, written by the enquiry form on a send
 * that resolved, and are cleared as they are read. Nothing stored means no
 * conversion, so these all fire nothing: a visitor who opens /thank-you directly,
 * a reload, coming back to it later, a bot caught by the trap, and a lead sent by
 * a plain post with no script. That last one is a real lead, in the team's inbox,
 * which Google Ads does not hear about, because no script ran to store its details.
 *
 * This used to fire for every visit, with the two fields empty when nothing was
 * stored, as it did on the company's earlier site. That counted people who never
 * enquired.
 */
export function ThankYouConversion() {
  const fired = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; the container must not see the
    // conversion twice because of it.
    if (fired.current) return;
    fired.current = true;
    const lead = takeLead();
    if (lead) trackGenerateLead(lead);
  }, []);

  return null;
}

/** WhatsApp with the Dubai desk, reported under its own label. */
export function ThankYouWhatsApp() {
  return (
    <ButtonLink
      href={WHATSAPP_HREF}
      onClick={() => trackWhatsAppClick("Thank You WhatsApp")}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      icon={
        <MessageCircle aria-hidden="true" className="size-4 shrink-0 text-whatsapp-ink" strokeWidth={2} />
      }
    >
      Message us on WhatsApp
      <span className="sr-only"> (opens in a new tab)</span>
    </ButtonLink>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { landingCopy } from "@/constants/landing";
import { office, site } from "@/constants/zan";
import { trackWhatsAppClick } from "@/lib/analytics";
import { waLink } from "@/lib/links";
import { useConsent } from "@/lib/useConsent";
import { cn } from "@/lib/utils";
import { QuoteButton } from "./QuoteButton";

const EASE = [0.16, 1, 0.3, 1] as const;
const WHATSAPP_HREF = waLink(site.whatsapp, site.name);
/** Clear air between the dock and a cookie banner it is sitting on. */
const BANNER_GAP = 12;

const iconButton =
  "grid size-12 shrink-0 place-items-center rounded-full border border-border-strong bg-surface transition-[border-color,color,translate] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-foreground md:size-11";

/**
 * "Get My Free Quote", following the reader.
 *
 * On screen most of the time: from the moment the page loads, until a form comes
 * into the window, when that form's own button is doing the work and this one
 * steps aside. Pressing it opens the form in a popup, so the visitor keeps their
 * place on the page.
 *
 * A bar along the thumb's edge on a phone, with the call and WhatsApp beside it.
 * From md a floating pill in the bottom-right corner, where the site's own
 * contact dock sits and where it covers the least of a left-aligned page.
 *
 * The cookie banner runs along the same edge until it is answered, and it stays
 * on top of this. Hiding under it would lose the button for anyone who ignores
 * the banner, so the dock measures it and rides on top instead.
 */
export function QuoteDock({ label, show }: { label: string; show: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const consent = useConsent();
  const copy = landingCopy;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || consent !== null) return;
    const banner = document.querySelector("[data-consent-banner]");
    if (!banner) return;
    const measure = () =>
      root.style.setProperty("--lp-dock-lift", `${banner.getBoundingClientRect().height + BANNER_GAP}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--lp-dock-lift");
    };
  }, [consent]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 flex justify-center md:justify-end md:px-6",
        "bottom-[var(--lp-dock-lift,0px)] transition-[bottom] duration-500 ease-out-expo",
        "md:bottom-[calc(var(--lp-dock-lift,0px)+1.5rem)]",
      )}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            key="dock"
            initial={{ y: "130%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "130%", opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className={cn(
              "pointer-events-auto flex w-full items-center gap-2 border-t border-border bg-surface-raised px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]",
              "shadow-[0_-12px_32px_-16px_color-mix(in_oklab,var(--color-shadow)_22%,transparent)]",
              "md:w-auto md:gap-2.5 md:rounded-full md:border md:border-border-strong md:p-2 md:shadow-float xl:pl-6",
            )}
          >
            <p className="mr-4 hidden min-w-0 xl:block">
              <span className="block text-small leading-tight font-semibold whitespace-nowrap text-foreground">{label}</span>
              <Eyebrow as="span" className="mt-1 text-[0.625rem] leading-none">
                Free consultation
              </Eyebrow>
            </p>

            <a
              href={`tel:${office.phoneTel}`}
              aria-label={`Call the ${office.city} office: ${office.phoneDisplay}`}
              data-analytics-label="Landing Sticky Call"
              className={cn(iconButton, "text-accent-ink")}
            >
              <Phone aria-hidden="true" className="size-[1.125rem]" />
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp (opens in a new tab)"
              onClick={() => trackWhatsAppClick("Landing Sticky WhatsApp")}
              className={cn(iconButton, "text-whatsapp-ink")}
            >
              <SocialIcon name="WhatsApp" className="size-[1.125rem]" />
            </a>
            <QuoteButton
              location="sticky_button"
              size="lg"
              className="h-12 min-w-0 flex-1 px-5 text-[0.9375rem] md:flex-none md:px-6"
            >
              {copy.cta.primary}
            </QuoteButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { landingCopy } from "@/constants/landing";
import { hero, office, site } from "@/constants/zan";
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
 * the banner. While it is up the dock goes compact (no label, the short button
 * text) and stays on the bottom edge beside it, from md the banner takes the
 * left two thirds. Only where the two would still overlap, on a phone or a
 * narrow tablet, does the dock measure the banner and ride on top of it.
 */
export function QuoteDock({ label, show }: { label: string; show: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const consent = useConsent();
  const copy = landingCopy;
  const bannerUp = consent === null;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !bannerUp) return;
    const banner = document.querySelector("[data-consent-banner]");
    if (!banner) return;
    const measure = () => {
      const edge = banner.getBoundingClientRect();
      const dock = root.querySelector("aside")?.getBoundingClientRect();
      // The dock's left edge does not move with the lift, so it can be read now.
      const beside = dock !== undefined && dock.left >= edge.right + BANNER_GAP;
      root.style.setProperty("--lp-dock-lift", beside ? "0px" : `${edge.height + BANNER_GAP}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(banner);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--lp-dock-lift");
    };
  }, [bannerUp, show]);

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
          // The bar itself is the landmark, not the wrapper round it: the wrapper
          // stays when the bar steps aside, and would be an empty one then.
          <motion.aside
            key="dock"
            aria-label="Get a quote"
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
            <p className={cn("mr-4 hidden min-w-0", !bannerUp && "xl:block")}>
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
              {bannerUp ? hero.primary.short : copy.cta.primary}
            </QuoteButton>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

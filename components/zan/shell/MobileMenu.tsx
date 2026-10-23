"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown, Phone } from "lucide-react";
import { ctas, mainNav, office, practices, site } from "@/constants/zan";
import { ButtonLink } from "@/components/zan/ui/Button";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { getLenis } from "@/hooks/useLenis";
import { trackWhatsAppClick } from "@/lib/analytics";
import { MQ } from "@/lib/gsap";
import { waLink } from "@/lib/links";
import { useSiteHref } from "@/lib/useSiteHref";
import { cn } from "@/lib/utils";
import { MenuToggle } from "./MenuToggle";
import { SocialIcon } from "./SocialIcon";
import { focusables, scrollToHash, useMediaQuery } from "./shellStore";

const EASE = [0.16, 1, 0.3, 1] as const;
const CINEMA = [0.76, 0, 0.24, 1] as const;

/* The sheet grows out of the toggle that opened it and shrinks back into it.
   The circle is centred on the toggle: the right edge of container-zan, less
   the container's padding and half the 44px button, and half the 72px bar
   down. A percentage radius is measured against the box's diagonal over √2,
   so 150% reaches the far bottom-left corner from anywhere on the top edge.
   Both ends use the same units and the same centre, so the browser only ever
   interpolates the radius. */
const ORIGIN = "at calc(100% - clamp(1.25rem, 0.6rem + 2.8vw, 3rem) - 22px) 36px";

const sheet: Variants = {
  hidden: { clipPath: `circle(0% ${ORIGIN})` },
  visible: {
    clipPath: `circle(150% ${ORIGIN})`,
    transition: { duration: 0.75, ease: CINEMA, staggerChildren: 0.055, delayChildren: 0.16 },
  },
  exit: {
    clipPath: `circle(0% ${ORIGIN})`,
    transition: { duration: 0.5, ease: CINEMA },
  },
};

/* Reduced motion: no circle sweeping across the screen, just the sheet. */
const sheetStill: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

/** The office card's two buttons: one size, one outline, side by side. */
const OFFICE_ACTION =
  "flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-bg text-small font-semibold text-ink transition-[border-color,scale] duration-300 ease-out-expo hover:border-ink active:scale-[0.98]";

/**
 * Full-screen menu below 1280px: its own bar (logo + the close toggle, in the
 * same spot as the header's), the tabs with a Services accordion, the main
 * CTA, and the Dubai office: its number, with a call and a WhatsApp button.
 *
 * Tabs and disciplines are pages of this site and navigate normally. An
 * in-page anchor (the CTA) closes the menu first and then glides there —
 * Lenis ignores scrollTo while stopped, so the unlock comes first.
 *
 * While open: page scroll is locked (Lenis stopped, overflow hidden), focus
 * is trapped inside and Escape closes.
 */
export function MobileMenu({
  open,
  id,
  onClose,
}: {
  open: boolean;
  id: string;
  onClose: (opts?: { restoreFocus?: boolean }) => void;
}) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const href = useSiteHref();
  // The menu only ever opens after hydration, so the store has the real
  // answer by the time it is read for the sheet.
  const reduce = useMediaQuery(MQ.reduce);

  // Scroll lock, focus trap and Escape — only while open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    getLenis()?.stop();

    // Focus the dialog itself (no ring); the first Tab lands on its first link.
    const focusFirst = requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose({ restoreFocus: true });
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = focusables(panel);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = active === panel || !panel.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // The menu does not exist at 1280px and up; growing past it closes it.
    const wide = window.matchMedia("(min-width: 1280px)");
    const onWide = () => wide.matches && onClose();
    wide.addEventListener("change", onWide);

    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      getLenis()?.start();
    };
  }, [open, onClose]);

  /** A page link just closes (the browser navigates); an anchor closes, unlocks, then glides. */
  const go = (e: MouseEvent<HTMLAnchorElement>, target: string) => {
    if (!target.startsWith("#")) {
      onClose();
      return;
    }
    e.preventDefault();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    getLenis()?.start();
    onClose();
    requestAnimationFrame(() => scrollToHash(target));
  };

  return (
    <AnimatePresence onExitComplete={() => setServicesOpen(false)}>
      {open && (
        <motion.div
          ref={panelRef}
          id={id}
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          tabIndex={-1}
          variants={reduce ? sheetStill : sheet}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-lenis-prevent
          className="fixed inset-0 z-60 flex h-dvh flex-col overflow-y-auto overscroll-contain bg-bg outline-none xl:hidden"
        >
          <div className="container-zan flex h-nav shrink-0 items-center justify-between">
            <SiteLink
              href="#main"
              onClick={(e) => go(e, href("#top"))}
              aria-label={`${site.name} home`}
              className="rounded-lg"
            >
              {/* The header's size, so the logo does not jump as the sheet
                  opens over it. */}
              <ZanLogo className="h-7 sm:h-8" />
            </SiteLink>
            <MenuToggle open morphIn onClick={() => onClose({ restoreFocus: true })} controls={id} />
          </div>

          <div className="container-zan flex flex-1 flex-col pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Menu">
              <ul className="border-t border-line">
                {mainNav.map((item, i) => {
                  const hasSections = Boolean(item.sections?.length);
                  const itemHref = href(item.href);
                  return (
                    <motion.li key={item.label} variants={row} className="border-b border-line">
                      <div className="flex items-center gap-2">
                        <SiteLink
                          href={item.href}
                          onClick={(e) => go(e, itemHref)}
                          className="group flex min-h-16 flex-1 items-baseline gap-4 py-4 text-ink"
                        >
                          <span className="w-6 shrink-0 font-mono text-eyebrow text-muted">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-sans text-[clamp(1.75rem,1.3rem+2vw,2.5rem)] leading-none font-bold tracking-[-0.035em] uppercase transition-colors duration-300 group-active:text-brand-ink">
                            {item.label}
                          </span>
                        </SiteLink>
                        {hasSections && (
                          <button
                            type="button"
                            onClick={() => setServicesOpen((v) => !v)}
                            aria-expanded={servicesOpen}
                            aria-controls={`${id}-services`}
                            aria-label={`${servicesOpen ? "Hide" : "Show"} ${item.label.toLowerCase()}`}
                            className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors duration-300 hover:bg-surface"
                          >
                            <ChevronDown
                              aria-hidden="true"
                              className={cn(
                                "size-5 transition-transform duration-500 ease-out-expo",
                                servicesOpen && "rotate-180",
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {hasSections && (
                        <AnimatePresence initial={false}>
                          {servicesOpen && (
                            <motion.div
                              id={`${id}-services`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.45, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="grid gap-6 pb-6 pl-10 sm:grid-cols-3 sm:gap-4">
                                {item.sections!.map((section, s) => {
                                  const sectionHref = href(section.href);
                                  return (
                                    <div key={section.title}>
                                      <SiteLink
                                        href={section.href}
                                        onClick={(e) => go(e, sectionHref)}
                                        className="flex items-baseline gap-2.5 py-1.5"
                                      >
                                        <span className="font-mono text-eyebrow text-brand-ink">
                                          {practices[s]?.index}
                                        </span>
                                        <span className="font-display text-h3 font-semibold text-ink">
                                          {section.title}
                                        </span>
                                      </SiteLink>
                                      <ul className="mt-1">
                                        {section.items.map((leaf) => {
                                          const leafHref = href(leaf.href);
                                          return (
                                            <li key={leaf.label}>
                                              <SiteLink
                                                href={leaf.href}
                                                onClick={(e) => go(e, leafHref)}
                                                className="block py-2 text-body text-ink-2 transition-colors duration-300 hover:text-ink active:text-brand-ink"
                                              >
                                                {leaf.label}
                                              </SiteLink>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div variants={row} className="mt-8">
              <ButtonLink
                href={href(ctas.project.href)}
                size="lg"
                onClick={(e) => go(e, href(ctas.project.href))}
                className="w-full"
              >
                {ctas.project.label}
              </ButtonLink>
            </motion.div>

            {/* The office as a card of its own: where it is, its number set
                large, and the two ways to use that number (the same line
                takes calls and WhatsApp). Outline pills, so "Start a Project"
                above stays the one gold action on the sheet. */}
            <motion.section
              variants={row}
              aria-labelledby={`${id}-office`}
              className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6"
            >
              {/* Plain text after the dot, so on the narrowest phones it wraps
                  rather than cutting the country short. */}
              <h2
                id={`${id}-office`}
                className="flex items-center gap-2.5 font-mono text-eyebrow text-muted uppercase"
              >
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand" />
                <span>
                  {office.city}, {office.country}
                </span>
              </h2>
              <p className="mt-3 font-display text-h2 text-ink tabular-nums">{office.phoneDisplay}</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${office.phoneTel}`}
                  aria-label={`Call ${office.phoneDisplay}`}
                  data-analytics-label={office.phoneDisplay}
                  className={OFFICE_ACTION}
                >
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-brand-ink" />
                  Call
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackWhatsAppClick("Mobile Menu WhatsApp")}
                  className={OFFICE_ACTION}
                >
                  <SocialIcon name="WhatsApp" className="size-4 shrink-0 text-whatsapp" />
                  WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </motion.section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

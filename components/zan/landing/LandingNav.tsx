"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Phone } from "lucide-react";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { landingCopy } from "@/constants/landing";
import { hero, office, site } from "@/constants/zan";
import { trackWhatsAppClick } from "@/lib/analytics";
import { waLink } from "@/lib/links";
import { cn } from "@/lib/utils";
import { QuoteButton } from "./QuoteButton";

/* The same bar as the site's: transparent at the very top, solid from 24px. */

const SOLID_AT = 24;
const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

const roundButton =
  "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface transition-colors duration-300 hover:border-border-strong sm:size-11";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > SOLID_AT,
    () => false,
  );
}

/** Which of the nav's sections the reader is in. Null above the first of them. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
          else setCurrent((id) => (id === entry.target.id ? null : id));
        }
      },
      // A thin band across the upper part of the window: one section at a time.
      { rootMargin: "-30% 0px -69% 0px" },
    );
    for (const { id } of landingCopy.sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return current;
}

/**
 * A landing page carries its own bar rather than the site's: no mega menu, no
 * pages to wander off to, nothing that routes a paid visitor away from the form.
 * Every link is an anchor on this page, the logo included, and the main site is
 * one link in the footer for anyone who goes looking.
 *
 * WhatsApp and the phone are always here, on every width. The sticky button
 * carries them too, but it steps aside whenever a form is on screen, and in this
 * market a visitor who would rather message than fill in a form is common.
 */
export function LandingNav() {
  const scrolled = useScrolled();
  const current = useCurrentSection();
  const { sections, cta } = landingCopy;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-nav">
      {/* Its own layer, so it can fade in without fading the bar's content. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 border-b border-border bg-surface-raised shadow-nav",
          "transition-opacity duration-500 ease-smooth",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="container-zan flex h-full items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <a
          href="#main"
          aria-label={`${site.name}: back to the top of this page`}
          className="-ml-1 inline-flex w-fit shrink-0 items-center rounded-lg p-1 transition-opacity duration-300 hover:opacity-75"
        >
          <ZanLogo eager className="h-7 sm:h-8" />
        </a>

        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {sections.map(({ id, label }) => {
              const active = current === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? "location" : undefined}
                    className={cn(
                      "group/tab relative inline-flex h-10 items-center rounded-full px-3.5 text-small font-medium tracking-[-0.01em] transition-colors duration-300",
                      active ? "text-foreground" : "text-muted hover:text-foreground",
                    )}
                  >
                    {label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-x-3.5 bottom-1 h-[1.5px] rounded-full bg-accent-ink transition-[scale] duration-500 ease-out-expo",
                        active
                          ? "origin-left scale-x-100"
                          : "origin-right scale-x-0 group-hover/tab:origin-left group-hover/tab:scale-x-100",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp (opens in a new tab)"
            onClick={() => trackWhatsAppClick("Landing Nav WhatsApp")}
            className={cn(roundButton, "text-whatsapp-ink")}
          >
            <SocialIcon name="WhatsApp" className="size-[1.125rem]" />
          </a>
          <a
            href={`tel:${office.phoneTel}`}
            data-analytics-label={office.phoneDisplay}
            className="hidden h-10 items-center gap-2 rounded-full px-2 text-small font-medium whitespace-nowrap text-muted transition-colors duration-300 hover:text-accent-ink xl:inline-flex"
          >
            <Phone aria-hidden="true" className="size-4 shrink-0 text-accent-ink" />
            <span className="sr-only">Call the {office.city} office: </span>
            <span className="tabular-nums">{office.phoneDisplay}</span>
          </a>{" "}
          <a
            href={`tel:${office.phoneTel}`}
            aria-label={`Call the ${office.city} office: ${office.phoneDisplay}`}
            data-analytics-label={office.phoneDisplay}
            className={cn(roundButton, "text-foreground hover:text-accent-ink xl:hidden")}
          >
            <Phone aria-hidden="true" className="size-[1.125rem]" />
          </a>
          {/* The short label on a phone, the site's own, so three controls and
              the logo still fit a 360px bar. */}
          <QuoteButton
            location="nav"
            arrow={false}
            className="h-10 px-3.5 text-small sm:h-11 sm:px-5 sm:text-[0.9375rem]"
          >
            <span className="sm:hidden">{hero.primary.short}</span>{" "}
            <span className="hidden sm:inline">{cta.nav}</span>
          </QuoteButton>
        </div>
      </div>
    </header>
  );
}

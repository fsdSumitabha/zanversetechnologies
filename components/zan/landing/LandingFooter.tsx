"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon } from "@/components/zan/shell/SocialIcon";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { landingCopy } from "@/constants/landing";
import { legalLinks, office, site } from "@/constants/zan";
import { trackWhatsAppClick } from "@/lib/analytics";
import { openConsentSettings } from "@/lib/consent";
import { waLink } from "@/lib/links";
import { cn } from "@/lib/utils";

const WHATSAPP_HREF = waLink(site.whatsapp, site.name);
/** Module scope, so render stays pure. */
const YEAR = new Date().getFullYear();

const contactRow =
  "group/contact inline-flex min-h-11 items-center gap-3 text-body text-foreground transition-colors duration-300 hover:text-accent-ink md:min-h-0";
const contactGlyph =
  "grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface transition-colors duration-300 group-hover/contact:border-accent group-hover/contact:bg-accent group-hover/contact:text-accent-foreground";
const legal = "inline-flex min-h-11 items-center transition-colors duration-300 hover:text-foreground md:min-h-0";

/**
 * A cut-down footer: who this is, the Dubai office and how to reach it, and the
 * legal links a paid page has to carry. They open in a new tab so that reading
 * the privacy policy does not cost anyone a half-filled form.
 *
 * The bottom padding leaves room for the sticky button, which stays on screen
 * over this to the end of the page.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted text-foreground">
      <div className="container-zan grid gap-x-8 gap-y-10 pt-14 pb-10 md:grid-cols-2 lg:grid-cols-12">
        <div className="md:col-span-2 lg:col-span-5">
          <ZanLogo className="h-9" />
          <p className="mt-5 max-w-sm text-body text-muted">{landingCopy.footer.blurb}</p>
        </div>

        <div className="lg:col-span-3">
          <h2 className="flex items-center gap-2.5 font-mono text-eyebrow text-subtle uppercase">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            {office.city} office
          </h2>
          <address className="mt-4 flex gap-3 text-body text-muted not-italic">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent-ink" />
            <span>
              {office.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block">{office.country}</span>
            </span>
          </address>
        </div>

        <div className="lg:col-span-4">
          <h2 className="font-mono text-eyebrow text-subtle uppercase">Contact</h2>
          <ul className="mt-3 md:mt-4 md:space-y-2.5">
            <li>
              <a
                href={`tel:${office.phoneTel}`}
                data-analytics-label={office.phoneDisplay}
                className={cn(contactRow, "font-medium tabular-nums")}
              >
                <span aria-hidden="true" className={cn(contactGlyph, "text-accent-ink")}>
                  <Phone className="size-4" />
                </span>
                {office.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener"
                onClick={() => trackWhatsAppClick("Landing Footer WhatsApp")}
                className={contactRow}
              >
                <span aria-hidden="true" className={cn(contactGlyph, "text-whatsapp-ink")}>
                  <SocialIcon name="WhatsApp" className="size-4" />
                </span>
                WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={cn(contactRow, "break-all")}>
                <span aria-hidden="true" className={cn(contactGlyph, "text-accent-ink")}>
                  <Mail className="size-4" />
                </span>
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-zan">
        <div className="flex flex-col gap-3 border-t border-border pt-6 pb-28 text-[0.8125rem] leading-relaxed text-subtle lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <p>
            © <span suppressHydrationWarning>{YEAR}</span> {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 md:gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener" className={legal}>
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
            {/* The Cookie Policy promises this can be changed at any time, on any page. */}
            <li>
              <button type="button" onClick={openConsentSettings} className={legal}>
                Cookie settings
              </button>
            </li>
            <li>
              <Link href="/" className={cn(legal, "font-medium text-muted")}>
                {landingCopy.footer.mainSite}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

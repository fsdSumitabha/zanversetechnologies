"use client";

import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/zan/ui/Button";
import { hero, site } from "@/constants/zan";
import { trackWhatsAppClick } from "@/lib/analytics";
import { waLink } from "@/lib/links";
import { useSiteHref } from "@/lib/useSiteHref";
import { cn } from "@/lib/utils";

/** md on phones, so both pills fit side by side at 360px; lg from 640px. */
const SIZE = "h-12 px-5 text-[0.9375rem] sm:h-13 sm:px-7 sm:text-base";

/** The Dubai desk on WhatsApp, with the company's name in the greeting. */
const WHATSAPP = waLink(site.whatsapp, site.name);

/**
 * The hero's two calls to action, as on the old site: the contact page, and
 * WhatsApp with the Dubai desk. Short labels below 640px. A client component
 * for the WhatsApp click's analytics event; the primary href is resolved with
 * useSiteHref like every other href that comes from constants.
 */
export function HeroActions() {
  const href = useSiteHref();

  return (
    <>
      <ButtonLink href={href(hero.primary.href)} size="lg" className={SIZE}>
        <span className="hidden sm:inline">{hero.primary.label}</span>
        <span className="sm:hidden">{hero.primary.short}</span>
      </ButtonLink>

      <ButtonLink
        href={WHATSAPP}
        onClick={() => trackWhatsAppClick("Hero WhatsApp Button")}
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
        size="lg"
        icon={<MessageCircle aria-hidden="true" className="size-[1.125rem] shrink-0 text-whatsapp" strokeWidth={2} />}
        className={cn(SIZE, "bg-bg")}
      >
        <span className="hidden sm:inline">{hero.whatsapp.label}</span>
        <span className="sm:hidden">{hero.whatsapp.short}</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </ButtonLink>
    </>
  );
}

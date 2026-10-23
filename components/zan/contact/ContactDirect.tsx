import { Mail, Phone } from "lucide-react";
import { office, site } from "@/constants/zan";
import { ButtonLink } from "@/components/zan/ui/Button";
import { cn } from "@/lib/utils";

/** Tap-to-call the Dubai office, or write to the inbox. */
export function ContactDirect({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-7 gap-y-3", className)}>
      <ButtonLink
        href={`tel:${office.phoneTel}`}
        variant="secondary"
        icon={<Phone aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />}
      >
        Call {office.phoneDisplay}
      </ButtonLink>
      <ButtonLink
        href={`mailto:${site.email}`}
        variant="ghost"
        icon={<Mail aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />}
      >
        {site.email}
      </ButtonLink>
    </div>
  );
}

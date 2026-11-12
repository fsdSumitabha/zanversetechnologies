"use client";

import { ctas, site } from "@/constants/zan";
import { useSiteHref } from "@/lib/useSiteHref";
import { ButtonLink } from "@/components/zan/ui/Button";

/** Under the FAQ heading: the full contact page, and the inbox. */
export function FaqAside() {
  const href = useSiteHref();
  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      <ButtonLink href={href(ctas.contact.href)} variant="secondary" arrow>
        {ctas.contact.label}
      </ButtonLink>{" "}
      <a
        href={`mailto:${site.email}`}
        className="inline-flex min-h-11 items-center text-small text-muted underline decoration-border-strong underline-offset-4 transition-colors md:min-h-0 hover:text-accent-ink hover:decoration-current"
      >
        {site.email}
      </a>
    </div>
  );
}

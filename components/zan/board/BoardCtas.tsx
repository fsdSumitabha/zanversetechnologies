"use client";

import { ButtonLink } from "@/components/zan/ui/Button";
import { ctas } from "@/constants/zan";
import { useSiteHref } from "@/lib/useSiteHref";

/**
 * The Board section's two calls to action. Hrefs go through useSiteHref: a
 * page path passes through as written, and an in-page anchor ("#contact")
 * stays an anchor on the homepage and becomes "/#contact" anywhere else.
 */
export function BoardCtas() {
  const href = useSiteHref();
  return (
    <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
      <ButtonLink href={href(ctas.project.href)} size="lg">
        {ctas.project.label}
      </ButtonLink>
      <ButtonLink href={href(ctas.work.href)} size="lg" variant="secondary">
        {ctas.work.label}
      </ButtonLink>
    </div>
  );
}

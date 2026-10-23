"use client";

import { usePathname } from "next/navigation";
import { siteHref } from "@/lib/links";

/**
 * Resolves any href that comes from constants for the page it is on:
 * `const href = useSiteHref(); href(ctas.contact.href)`.
 *
 * An in-page anchor gains the homepage's path when it is rendered anywhere
 * else, so the navbar's "Start a Project" (#contact) still reaches the enquiry
 * section from /services. Paths, tel:, mailto: and external URLs come back
 * unchanged.
 *
 * Its own module, with "use client", so lib/links.ts stays importable from
 * server components.
 */
export function useSiteHref() {
  const pathname = usePathname() || "/";
  return (path: string) => siteHref(path, pathname);
}

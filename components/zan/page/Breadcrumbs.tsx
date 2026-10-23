import { ChevronRight } from "lucide-react";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { labels } from "@/constants/pages";
import { absoluteUrl } from "@/lib/metadata";
import { jsonLd } from "@/lib/schema";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href: string;
}

/**
 * The trail back up a page, with the matching BreadcrumbList data so search
 * results show the same path. The last crumb is the current page and is not a
 * link.
 *
 * The item URLs come from `absoluteUrl` (lib/metadata.ts), the helper every
 * canonical and the sitemap are built from, so the trail can never name a
 * page differently from the page itself. The homepage crumb is the bare
 * origin, exactly as its canonical is.
 *
 * Plain server markup with no request data, so a page that renders a trail
 * still prerenders. It renders inside PageHero, which is a server component;
 * nothing client-side imports it.
 */
export function Breadcrumbs({ trail, className }: { trail: readonly Crumb[]; className?: string }) {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href),
    })),
  };
  const last = trail.length - 1;
  return (
    <nav aria-label={labels.breadcrumb} className={cn("min-w-0", className)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbList) }}
      />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-eyebrow text-muted uppercase">
        {trail.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-line-strong" />}
            {i === last ? (
              <span aria-current="page" className="text-ink-2">
                {crumb.label}
              </span>
            ) : (
              <SiteLink
                href={crumb.href}
                // The padding only grows the tap area on phones; the negative
                // margin keeps the trail's line height as it was.
                className="-my-4 inline-block rounded py-4 transition-colors duration-300 hover:text-brand-ink md:my-0 md:py-0"
              >
                {crumb.label}
              </SiteLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

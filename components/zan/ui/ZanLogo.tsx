import Image from "next/image";
import { site } from "@/constants/zan";
import { cn } from "@/lib/utils";

/**
 * The company's lockup: the Zan Verse Technologies mark and "zvt", drawn as a
 * vector from the artwork in assets-src/brand. Sized by height (h-7 in the
 * bar, h-12 on the preloader) with the width following its 1201x415 viewBox,
 * so it reserves its box before the image loads and never shifts the bar.
 * next/image serves an SVG as it is, so there is no srcset to size.
 *
 * No hook and no state, so it is not a client component of its own: a server
 * page can render it as it is, and the shell's client components simply
 * include it.
 */
export function ZanLogo({ className, eager = false }: { className?: string; eager?: boolean }) {
  return (
    <Image
      src={site.logo.src}
      alt={site.name}
      width={site.logo.width}
      height={site.logo.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={cn("h-8 w-auto select-none", className)}
      draggable={false}
    />
  );
}

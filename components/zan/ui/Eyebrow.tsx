import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mono caps label with an accent dot — the page's section marker.
 *
 * tone="brand"   accent-ink text on the page ground (default)
 * tone="current" inherits the colour around it; use on brand fills, where the
 *                surrounding text is already text-action-foreground
 * tone="onBrand" on a brand fill too, with the accent dot kept: the text a
 *                little softer than the heading under it
 */
const TONES = {
  brand: { text: "text-accent-ink", dot: "bg-accent" },
  current: { text: "text-current", dot: "bg-current" },
  onBrand: { text: "text-action-foreground/80", dot: "bg-accent dark:bg-action-foreground" },
} as const;

export function Eyebrow({
  children,
  tone = "brand",
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("inline-flex items-center gap-2.5 font-mono text-eyebrow uppercase", TONES[tone].text, className)}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", TONES[tone].dot)} />
      {children}
    </Tag>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mono caps label with an accent dot — the page's section marker.
 *
 * tone="brand"   accent-ink text on the page ground (default)
 * tone="current" inherits the colour around it; use on brand fills, where the
 *                surrounding text is already text-action-foreground
 */
export function Eyebrow({
  children,
  tone = "brand",
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  tone?: "brand" | "current";
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-eyebrow uppercase",
        tone === "brand" ? "text-accent-ink" : "text-current",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", tone === "brand" ? "bg-accent" : "bg-current")}
      />
      {children}
    </Tag>
  );
}

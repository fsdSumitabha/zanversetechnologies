import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { ctas } from "@/constants/zan";
import { ButtonLink, type ButtonSize, type ButtonVariant } from "./Button";

/**
 * Download Portfolio: the company portfolio as a PDF, beside the calls to
 * action of the homepage hero, the services pages, About Us and Contact Us.
 *
 * Only the browser ever opens the file. Nothing reads its size, its pages or
 * its contents, and its name carries no hash, so a new PDF saved over
 * public/downloads/zan-verse-technologies-portfolio.pdf is the one every
 * button hands out from the next deploy. Files in public/ are served with
 * max-age=0, so no browser keeps the old copy.
 */
export function PortfolioDownload({
  variant = "secondary",
  size = "lg",
  className,
  children = ctas.portfolioPdf.label,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** The label, for a page that shortens it on phones. */
  children?: ReactNode;
}) {
  return (
    <ButtonLink
      href={ctas.portfolioPdf.href}
      download
      variant={variant}
      size={size}
      arrow={false}
      icon={<Download aria-hidden="true" className="size-[1.125rem] shrink-0" strokeWidth={2} />}
      className={className}
    >
      {children}
      <span className="sr-only"> (PDF)</span>
    </ButtonLink>
  );
}

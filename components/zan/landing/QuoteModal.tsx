"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { focusables } from "@/components/zan/shell/shellStore";
import { landingCopy } from "@/constants/landing";
import { office } from "@/constants/zan";
import { getLenis } from "@/hooks/useLenis";
import { MQ } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { LandingForm } from "./LandingForm";
import type { QuoteRequest } from "./quoteContext";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The form, brought to the visitor by the sticky button or a package card.
 *
 * A real dialog, built as the site's contact modal is: focus moves in and is
 * trapped, Escape and the backdrop close it, the page behind cannot scroll, and
 * focus goes back to the button that opened it. It differs in one way. That
 * modal arrives uninvited, so it never drops a cursor into a field; this one
 * was asked for, so with a mouse the name field is ready to type in. On a phone
 * focus still goes to the panel, so the keyboard does not cover the form before
 * the visitor has seen it.
 *
 * On a phone it is a sheet from the bottom edge, where the thumb already is.
 *
 * The backdrop closes it only while the form is empty. A stray tap should not
 * cost anyone what they have typed; Escape and the close button are deliberate.
 */
export function QuoteModal({ request, onClose }: { request: QuoteRequest | null; onClose: () => void }) {
  const titleId = `${useId()}-title`;
  const panelRef = useRef<HTMLDivElement>(null);
  const open = Boolean(request);

  useEffect(() => {
    if (!open) return;

    // Safari does not focus a button on click, which leaves <body> active.
    const active = document.activeElement;
    const back = active instanceof HTMLElement && active !== document.body ? active : null;

    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    getLenis()?.stop();

    const focusIn = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const field = window.matchMedia(MQ.fine).matches
        ? panel.querySelector<HTMLElement>("input:not([type='hidden'])")
        : null;
      (field ?? panel).focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = focusables(panel);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const focused = document.activeElement;
      const outside = focused === panel || !panel.contains(focused);
      if (e.shiftKey && (focused === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (focused === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(focusIn);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      getLenis()?.start();
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  const onBackdrop = () => {
    const typed = panelRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input:not([type='hidden']), textarea",
    );
    if (typed && Array.from(typed).some((field) => field.value.trim())) return;
    onClose();
  };

  const copy = landingCopy.popup;

  return (
    <AnimatePresence>
      {request && (
        // Over the navbar (z-50) and the cookie banner (z-44).
        <div className="fixed inset-0 z-70 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden="true"
            onClick={onBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-lenis-prevent
            initial={{ opacity: 0, y: 32, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.995 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={cn(
              "relative z-10 w-full outline-none sm:max-w-xl",
              // Taller than the window on a phone, so it scrolls inside itself.
              "max-h-[92dvh] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]",
              "rounded-t-3xl border border-line bg-bg px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float",
              "sm:rounded-3xl sm:px-8 sm:py-7",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 grid size-10 place-items-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-surface hover:text-ink sm:top-5 sm:right-5"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            <Eyebrow className="hidden sm:inline-flex">{copy.eyebrow}</Eyebrow>
            <h2 id={titleId} className="pr-12 font-display text-h3 font-semibold text-ink sm:mt-3 sm:text-h2">
              {request.interest ? `Get a free quote for ${request.interest}` : copy.title}
            </h2>
            <p className="mt-1.5 text-small text-ink-2 sm:mt-2.5 sm:text-body">{copy.lead}</p>

            <LandingForm
              key={`${request.location}:${request.interest ?? ""}`}
              location={request.location}
              interest={request.interest}
              className="mt-5"
            />

            <p className="mt-4 border-t border-line pt-4 text-center text-small text-ink-2">
              Prefer to talk?{" "}
              <a
                href={`tel:${office.phoneTel}`}
                data-analytics-label="Landing Popup"
                className="inline-flex items-center gap-1.5 font-medium text-brand-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
              >
                <Phone aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                <span className="tabular-nums">{office.phoneDisplay}</span>
              </a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { trackPopupView } from "@/lib/analytics";
import { QuoteContext, type QuotePage, type QuoteRequest } from "./quoteContext";
import { QuoteDock } from "./QuoteDock";
import { QuoteModal } from "./QuoteModal";

/* ───────────────────────────────────────────────────────────────────────────
   One landing page's enquiry state.

   Two things every part of the page needs to agree on: which page this is, for
   the lead, and whether a form is on screen right now. The sticky button shows
   only while none is, and a call to action pressed while one IS on screen
   brings the visitor to that form rather than stacking a second copy on top.

   Rendered around the page by the server component, with the page's details
   handed down as plain data, so everything between here and the buttons stays
   server HTML.
   ─────────────────────────────────────────────────────────────────────────── */

/** On a form the page carries itself. The popup's form does not count. */
const INLINE_FORM = "[data-lp-form]";

/**
 * A form counts as on screen once it is properly in the window, not when its
 * top hairline has just crept over the bottom edge: at that point it cannot be
 * used yet, and the button is still the quickest way to reach one.
 */
const ON_SCREEN_MARGIN = "-14% 0px -14% 0px";

/** How long the gold ring stays on a form a button has pointed at. */
const ATTENTION_MS = 1400;

export function QuoteProvider({ page, children }: { page: QuotePage; children: ReactNode }) {
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  /** null until the observer has reported, so the button cannot flash at load. */
  const [formOnScreen, setFormOnScreen] = useState<boolean | null>(null);
  const onScreen = useRef(new Set<Element>());

  useEffect(() => {
    const visible = onScreen.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setFormOnScreen(visible.size > 0);
      },
      { rootMargin: ON_SCREEN_MARGIN },
    );
    document.querySelectorAll(INLINE_FORM).forEach((form) => observer.observe(form));
    return () => {
      observer.disconnect();
      visible.clear();
    };
  }, []);

  const ask = useCallback((next: QuoteRequest) => {
    /* A form is already there, so point at it. Not when a package was chosen:
       that choice has to reach a form, and the popup is the one that opens on
       it. */
    const [form] = onScreen.current;
    if (form instanceof HTMLElement && !next.interest) {
      form.querySelector<HTMLElement>("input:not([type='hidden'])")?.focus({ preventScroll: true });
      form.dataset.attention = "1";
      window.setTimeout(() => delete form.dataset.attention, ATTENTION_MS);
      return;
    }
    setRequest(next);
    trackPopupView("landing_quote_form");
  }, []);

  const close = useCallback(() => setRequest(null), []);

  const api = useMemo(() => ({ page, ask }), [page, ask]);

  return (
    <QuoteContext value={api}>
      {children}
      {/* Left in place under the popup's backdrop rather than taken away with
          it: it is usually what opened the popup, and focus has to go back to it. */}
      <QuoteDock label={page.label} show={formOnScreen === false} />
      <QuoteModal request={request} onClose={close} />
    </QuoteContext>
  );
}

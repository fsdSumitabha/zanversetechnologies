"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import { office } from "@/constants/zan";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { focusables, usePreloaded } from "@/components/zan/shell/shellStore";
import { getLenis } from "@/hooks/useLenis";
import { trackPopupView } from "@/lib/analytics";
import { emailjsReady } from "@/lib/emailjs";
import { cn } from "@/lib/utils";
import { EnquiryForm } from "./EnquiryForm";

/* ───────────────────────────────────────────────────────────────────────────
   THE CONTACT MODAL

   The enquiry form, brought to the visitor a while into a visit instead of
   waiting at the foot of the page to be found. That is an interruption, so
   every rule below is there to keep it from being the kind people install
   blockers for.

     Once per session.   Written to sessionStorage, not localStorage: a
                         returning visitor next week is worth asking again, a
                         visitor on their fourth page today is not.
     Never where the     Not on /contact-us, which is this form, and not on
     form already is.    /thank-you, which is a lead who has just written. Nor
                         while the form is on screen anywhere else: the
                         homepage carries it at its foot, and covering a form
                         with a copy of itself is how this feature goes wrong.
     Never with no       Without EmailJS credentials the form renders the
     way to send.        address instead, so there is nothing to interrupt
                         anyone for.
     Never over the      The delay is counted from the moment the preloader
     preloader.          leaves, not from load, or most of it is spent behind
                         a screen the visitor cannot read past.

   It is a real dialog. Focus moves into it and is trapped while it is open,
   Escape and the backdrop close it, the page behind cannot scroll, and focus
   goes back where it came from. Motion is left to <MotionConfig
   reducedMotion="user"> in Providers: for a visitor who has asked for less it
   drops the transforms and keeps the fade, so the modal still arrives. The
   content is the point, the movement is not.
   ─────────────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Long enough to have read something first, counted from the reveal. */
const DELAY_MS = 10_000;
/** How long to leave it before asking again, when the form is already in view. */
const RETRY_MS = 5_000;
/** sessionStorage: shown in this tab. */
const SEEN_KEY = "zan.contactModal.seen";
/** Pages that are the enquiry. */
const SUPPRESSED = ["/contact-us", "/thank-you"];
/** Set by EnquiryForm on the form it renders. */
const FORM = "[data-enquiry-form]";

/** Whether an enquiry form is rendered on this page and inside the viewport. */
function formInView(): boolean {
  const form = document.querySelector<HTMLElement>(FORM);
  if (!form) return false;
  const box = form.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}

export function ContactModal() {
  const pathname = usePathname() || "/";
  const revealed = usePreloaded();
  const uid = useId();
  const titleId = `${uid}-title`;

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Where focus was when it opened. */
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const suppressed = SUPPRESSED.includes(pathname);

  // The timer. Showing it is what records the visit, so a visitor who closes
  // it and one who reloads the page mid-enquiry are both asked exactly once.
  useEffect(() => {
    if (!revealed || suppressed || !emailjsReady) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      // Private mode, or storage refused. With no way to remember it, better
      // not to ask at all than to ask again on every page of the visit.
      return;
    }

    let timer = 0;
    const ask = () => {
      if (formInView()) {
        timer = window.setTimeout(ask, RETRY_MS);
        return;
      }
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage that reads but will not write. The modal may come back on
        // the next page of the visit; there is nothing worse than that here.
      }
      setOpen(true);
      trackPopupView("contact_modal");
    };
    timer = window.setTimeout(ask, DELAY_MS);
    return () => clearTimeout(timer);
  }, [revealed, suppressed]);

  /* Leaving the page closes it, including by the navigation the form makes
     itself on a send that resolved: this form's success state is /thank-you,
     and a dialog left sitting over that page would be asking a lead who has
     just written to write again. It is the cleanup rather than the body of the
     effect, so nothing happens on arrival — only on the way out. */
  useEffect(() => () => setOpen(false), [pathname]);

  // The scroll lock, Escape, and focus — only while it is open.
  useEffect(() => {
    if (!open) return;

    // Safari does not focus a button on click, which leaves <body> active.
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;

    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    getLenis()?.stop();

    /* The panel itself, not the first field: dropping a cursor into a text
       input opens the keyboard on a phone, which is a hostile way to greet
       someone who did not ask for this. The first Tab lands on Close. */
    const focusPanel = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
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
      cancelAnimationFrame(focusPanel);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      getLenis()?.start();
      const back = returnFocus.current;
      returnFocus.current = null;
      // Not after a navigation: whatever focus came from left with the page.
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
  }, [open, close]);

  if (suppressed || !emailjsReady) return null;

  return (
    <AnimatePresence>
      {open && (
        // Over the navbar (z-50) and the mobile menu (z-60), under the
        // preloader (z-200) and the skip link (z-300).
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            aria-hidden="true"
            onClick={close}
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
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={cn(
              "relative z-10 w-full outline-none sm:max-w-xl",
              // Taller than the window on a phone, so it scrolls inside itself
              // rather than running off the bottom.
              "max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain",
              "rounded-3xl border border-line bg-bg px-5 py-5 shadow-float sm:px-8 sm:py-7",
            )}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-surface hover:text-ink sm:top-5 sm:right-5"
            >
              <X aria-hidden="true" className="size-4" />
            </button>

            {/* Hidden on a phone, where it costs a line the form needs. */}
            <Eyebrow className="hidden sm:inline-flex">Free consultation</Eyebrow>
            <h2 id={titleId} className="max-w-[18ch] pr-12 text-h3 text-ink sm:mt-4 sm:text-h2">
              What are you building?
            </h2>
            {/* Desktop only, for the same reason: on a phone this is three
                lines between the heading and the first field, and it says what
                the note under the submit button already says. */}
            <p className="mt-3 hidden max-w-[48ch] text-body text-ink-2 sm:block">
              A short brief is enough to start. We come back within 24 hours with a view on scope,
              timeline and cost.
            </p>

            <EnquiryForm compact className="mt-5 sm:mt-7" />

            <p className="mt-5 text-small text-ink-2">
              Prefer to talk?{" "}
              <a
                href={`tel:${office.phoneTel}`}
                data-analytics-label="Contact Modal"
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

"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/zan/ui/Button";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { usePreloaded } from "@/components/zan/shell/shellStore";
import {
  getConsent,
  onConsentSettings,
  saveConsent,
  type Consent,
  type ConsentCategory,
} from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const NONE: Consent = { analytics: false, marketing: false };
const ALL: Consent = { analytics: true, marketing: true };

/** The two choices, named as the Cookie Policy names its categories. */
const CATEGORIES: readonly { key: ConsentCategory; label: string; detail: string }[] = [
  {
    key: "analytics",
    label: "Analytics",
    detail: "Google Analytics. Counts visits and shows which pages are read, so we can improve them.",
  },
  {
    key: "marketing",
    label: "Marketing",
    detail:
      "Google Ads, the Meta Pixel and the LinkedIn Insight Tag. They measure which ads lead to enquiries, and let those platforms show our ads to people who have visited.",
  },
];

const linkClass =
  "font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:text-brand-ink";

/* Kept small so the banner stays low: 40px on a phone, 36px from md, where
   there is a pointer. */
const compactButton = "h-10 px-4 text-small md:h-9";

/**
 * A checkbox drawn as a switch. The input is the whole control, laid over the
 * drawing, so it takes the click and wears the site's own focus ring. Off is a
 * hairline track, on is a filled one, and both clear 3:1 against the page.
 */
function Switch({
  id,
  checked,
  onChange,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  describedBy: string;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={describedBy}
        className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none rounded-full"
      />
      <span
        aria-hidden="true"
        className="h-7 w-12 rounded-full border border-muted bg-bg transition-colors duration-300 peer-checked:border-brand-ink peer-checked:bg-brand-ink"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 left-1 size-5 rounded-full bg-muted transition-[translate,background-color] duration-300 ease-out-expo peer-checked:translate-x-5 peer-checked:bg-bg"
      />
    </span>
  );
}

/**
 * The cookie banner, and the settings panel behind it.
 *
 * A visitor who has not chosen sees the banner once the preloader has gone:
 * one sentence on what would run, with Reject all and Accept all side by side
 * and drawn the same, because refusing must be as easy as agreeing. Cookie
 * settings, a link in that sentence, opens the panel to choose by category;
 * its switches start off, since a box ticked for the visitor is not consent.
 * The footer's Cookie settings opens the same panel on any page, at any time,
 * set to the choice already made; that is how consent is withdrawn.
 *
 * Nothing waits on the answer. The page works fully either way, and until
 * there is one every tag stays off.
 *
 * First in the body, straight after the skip link, so it is the first thing a
 * keyboard or a screen reader reaches, while on screen it runs along the
 * bottom: a card on a phone, one slim row across the window from md. Until the
 * visitor answers it covers the Contact Us dock; the navbar still carries the
 * phone number. It never takes focus on its own; opening the panel moves focus
 * to it, and closing puts focus back where it came from. Over the dock (z-40),
 * under the chat panel (z-45), the navbar (z-50) and the mobile menu (z-60).
 */
export function ConsentBanner() {
  const consent = useConsent();
  const entered = usePreloaded();
  const uid = useId();
  const titleId = `${uid}-title`;

  const [settingsOpen, setSettingsOpen] = useState(false);
  /** The panel's switches, applied only on Save. */
  const [draft, setDraft] = useState<Consent>(NONE);
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** Where focus was when the footer opened the panel. */
  const returnFocus = useRef<HTMLElement | null>(null);

  // The footer's Cookie settings, from any page.
  useEffect(
    () =>
      onConsentSettings(() => {
        // Safari does not focus a button on click, which leaves <body> active.
        const active = document.activeElement;
        returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
        setDraft(getConsent() ?? NONE);
        setSettingsOpen(true);
        requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      }),
    [],
  );

  const openSettings = () => {
    setDraft(NONE);
    setSettingsOpen(true);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  /** Without saving: back to the banner, or away if a choice already stands. */
  const closeSettings = () => {
    const back = returnFocus.current;
    returnFocus.current = null;
    setSettingsOpen(false);
    requestAnimationFrame(() => {
      if (back?.isConnected) back.focus({ preventScroll: true });
      else headingRef.current?.focus({ preventScroll: true });
    });
  };

  const choose = (choice: Consent) => {
    const back = returnFocus.current;
    returnFocus.current = null;
    setSettingsOpen(false);
    // Reloads the page if this takes back something already allowed.
    saveConsent(choice);
    if (back?.isConnected) requestAnimationFrame(() => back.focus({ preventScroll: true }));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Escape" || !settingsOpen) return;
    e.stopPropagation();
    closeSettings();
  };

  // Not on the server or during hydration, where the choice is unknown, and
  // not under the preloader.
  const visible = entered && (consent === null || settingsOpen);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          key="consent"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: EASE }}
          data-lenis-prevent
          className={cn(
            "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-44",
            "md:inset-x-6 md:bottom-6",
            // Never taller than the space under the navbar; the panel scrolls
            // inside itself on a landscape phone.
            "max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain",
            "rounded-2xl border border-line bg-bg p-2 shadow-float md:px-6 md:py-3",
          )}
        >
          <div className="relative">
            {settingsOpen ? (
              <>
                {/* The close button is pinned to the corner, level with the
                    heading. */}
                <h2 id={titleId} ref={headingRef} tabIndex={-1} className="pr-12 outline-none md:flex">
                  <Eyebrow as="span">Cookie settings</Eyebrow>
                </h2>
                <button
                  type="button"
                  onClick={closeSettings}
                  aria-label="Close cookie settings"
                  className="absolute -top-2 -right-2 grid size-11 place-items-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-surface hover:text-ink md:-top-3 md:-right-3 md:size-9"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
                <p className="mt-2 text-small text-ink-2 md:mt-1.5 md:max-w-3xl">
                  Choose what this site may use. You can change it again at any time from Cookie settings in
                  the footer.
                </p>

                {/* One column on a phone; three side by side once there is room. */}
                <ul className="mt-3 divide-y divide-line border-y border-line md:mt-2 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                  <li className="flex items-start justify-between gap-4 py-3 lg:px-6 lg:py-2.5 lg:first:pl-0 lg:last:pr-0">
                    <div className="min-w-0">
                      <p className="text-small font-medium text-ink">Strictly necessary</p>
                      <p className="mt-0.5 text-[0.8125rem] leading-normal text-ink-2">
                        Needed for the site to work, and to remember the choice you make here.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1.5 font-mono text-[0.625rem] leading-none tracking-[0.16em] whitespace-nowrap text-brand-ink uppercase">
                      Always on
                    </span>
                  </li>
                  {CATEGORIES.map(({ key, label, detail }) => {
                    const id = `${uid}-${key}`;
                    return (
                      <li
                        key={key}
                        className="flex items-start justify-between gap-4 py-3 lg:px-6 lg:py-2.5 lg:first:pl-0 lg:last:pr-0"
                      >
                        <div className="min-w-0">
                          <label htmlFor={id} className="block text-small font-medium text-ink">
                            {label}
                          </label>
                          <p id={`${id}-detail`} className="mt-0.5 text-[0.8125rem] leading-normal text-ink-2">
                            {detail}
                          </p>
                        </div>
                        <Switch
                          id={id}
                          describedBy={`${id}-detail`}
                          checked={draft[key]}
                          onChange={(on) => setDraft((d) => ({ ...d, [key]: on }))}
                        />
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <Button arrow={false} className={compactButton} onClick={() => choose(draft)}>
                    Save choices
                  </Button>
                  <SiteLink href="/cookie-policy" className={cn("text-small", linkClass)}>
                    Cookie Policy
                  </SiteLink>
                </div>
              </>
            ) : (
              // One sentence, its two links inline, then the two answers:
              // stacked on a phone, one row from md.
              <div className="md:flex md:items-center md:gap-6">
                <div className="min-w-0 text-[0.8125rem] leading-[1.6] text-ink-2 md:flex-1">
                  {/* The label runs in with the sentence rather than taking a
                      line of its own. */}
                  <h2 id={titleId} ref={headingRef} tabIndex={-1} className="mr-2 inline outline-none">
                    <Eyebrow as="span">Cookies</Eyebrow>
                  </h2>
                  <p className="inline">
                    We use cookies from Google Analytics, Google Ads, Meta and LinkedIn to understand how the
                    site is used and to measure our advertising. They load only if you agree, and you can
                    change your choice at any time.{" "}
                    {/* The dot stays with the first link, so a wrap falls after
                        it and never opens a line. */}
                    <span className="whitespace-nowrap">
                      <button type="button" onClick={openSettings} className={linkClass}>
                        Cookie settings
                      </button>
                      <span aria-hidden="true" className="ml-1.5 text-muted">
                        ·
                      </span>
                    </span>{" "}
                    <SiteLink href="/cookie-policy" className={cn("whitespace-nowrap", linkClass)}>
                      Cookie Policy
                    </SiteLink>
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 md:mt-0 md:w-60 md:shrink-0">
                  <Button variant="secondary" className={cn("w-full", compactButton)} onClick={() => choose(NONE)}>
                    Reject all
                  </Button>
                  <Button variant="secondary" className={cn("w-full", compactButton)} onClick={() => choose(ALL)}>
                    Accept all
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

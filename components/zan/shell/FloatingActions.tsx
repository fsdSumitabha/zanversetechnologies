"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, PenLine, X } from "lucide-react";
import { ctas, site } from "@/constants/zan";
import { AssistantMark } from "@/components/zan/chat/AssistantMark";
import { ChatPanelLazy } from "@/components/zan/chat/ChatPanelLazy";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { trackPopupView, trackWhatsAppClick } from "@/lib/analytics";
import { waLink } from "@/lib/links";
import { useConsent } from "@/lib/useConsent";
import { cn } from "@/lib/utils";
import { SocialIcon } from "./SocialIcon";
import { usePreloaded } from "./shellStore";

/** The Dubai desk, with the company's name in the greeting. */
const WHATSAPP_HREF = waLink(site.whatsapp, site.name);

/** Scroll this far with the menu open and it folds away. */
const COLLAPSE_AFTER = 24;
const MOBILE = "(max-width: 767.98px)";
const EASE = [0.16, 1, 0.3, 1] as const;

/* MOBILE as a store, so the dock wakes and sleeps with a resize or a turn of
   the phone. */
function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(MOBILE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isPhone = () => window.matchMedia(MOBILE).matches;
const notPhone = () => false;

const SHADOW = "shadow-[0_12px_28px_-12px_color-mix(in_oklab,var(--color-shadow)_45%,transparent)]";

const menu = {
  open: { transition: { staggerChildren: 0.045, staggerDirection: -1 } },
  closed: { transition: { staggerChildren: 0.03 } },
};
const row = {
  open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  closed: { opacity: 0, y: 10, transition: { duration: 0.16 } },
};

/** One row of the menu, so the two read as one set whatever they do. */
function Row({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  /** Colour for the glyph only. The pill itself is always a hairline on white. */
  tone: string;
}) {
  return (
    <span className="flex items-center gap-2.5 rounded-full border border-border-strong bg-surface-raised py-2.5 pr-4 pl-3.5 text-small font-medium whitespace-nowrap text-foreground shadow-lift transition-colors duration-300 group-hover/row:border-foreground">
      <span aria-hidden="true" className={cn("grid size-5 shrink-0 place-items-center", tone)}>
        {icon}
      </span>
      {label}
    </span>
  );
}

/**
 * Contact Us, bottom-right, with WhatsApp above it.
 *
 * WhatsApp with the Dubai desk has a button of its own, one tap from any page.
 * Contact Us opens two more ways to reach the company: the assistant (which
 * hands off to a person) and the enquiry form on /contact-us. Its menu opens
 * between the two buttons, so it stays against the button that opened it and
 * WhatsApp glides up out of its way. Tap-to-call is not repeated here — the
 * navbar (on a phone, its menu) and the footer carry the Dubai number.
 *
 * Above the sections (z-40) and under the navbar, the mobile menu and the
 * preloader. Both buttons stay put while the page scrolls, on a phone as on a
 * wide screen.
 *
 * The chat panel is a sibling, not a child: the dock steps aside with
 * `translate` while the chat is up, and a translated ancestor becomes the
 * containing block for a fixed descendant, which would drag the panel with it.
 */
export function FloatingActions() {
  const entered = usePreloaded();
  const menuId = useId();
  // null while the cookie banner is waiting for an answer. undefined on the
  // server and during hydration, so both render the dock awake.
  const consent = useConsent();

  const dialRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  /** Scroll position when the menu opened; null while it is closed. */
  const openedAtY = useRef<number | null>(null);
  /** Set when the chat was opened from here, so closing it hands focus back. */
  const returnFocus = useRef(false);

  const [open, setOpen] = useState(false);
  /** Mounted on the first "Chat with us" and kept, so a thread survives a close. */
  const [chatMounted, setChatMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  /** Phone width, where the cookie banner covers the dock. False on the server. */
  const phone = useSyncExternalStore(subscribePhone, isPhone, notPhone);

  const close = useCallback(() => {
    openedAtY.current = null;
    setOpen(false);
  }, []);

  const toggle = () => {
    if (open) {
      close();
    } else {
      openedAtY.current = window.scrollY;
      setOpen(true);
    }
  };

  const openChat = () => {
    close();
    returnFocus.current = true;
    setChatMounted(true);
    setChatOpen(true);
    // One of the site's two overlays. Named so the reports can tell it apart
    // from the enquiry modal ("contact_modal").
    trackPopupView("assistant_panel");
  };

  const closeChat = useCallback(() => setChatOpen(false), []);

  // Escape or the panel's own close button put focus back on Contact Us. It
  // has to wait for the commit that clears `inert` below, so it runs here
  // rather than inside the click handler.
  useEffect(() => {
    if (chatOpen || !returnFocus.current) return;
    returnFocus.current = false;
    toggleRef.current?.focus();
  }, [chatOpen]);

  // Phones: fold the menu once the page really moves. A nudge with the menu
  // open is ignored. The buttons themselves stay put while the page scrolls.
  useEffect(() => {
    const mobile = window.matchMedia(MOBILE);
    const onScroll = () => {
      if (!mobile.matches || openedAtY.current === null) return;
      if (Math.abs(window.scrollY - openedAtY.current) <= COLLAPSE_AFTER) return;
      close();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [close]);

  // While the menu is open: an outside pointer or Escape folds it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!dialRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      // Not an Escape that another layer has handled, or one meant for an
      // overlay opened over the dock, which has made the dock inert.
      if (e.key !== "Escape" || e.defaultPrevented || dialRef.current?.closest("[inert]")) return;
      close();
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  /** Drop-in after the preloader. */
  const reveal: CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? "none" : "translateY(14px)",
    transitionDelay: entered ? "0.35s" : "0s",
  };

  /* Out of the tree and the focus order, though not out of sight, in two cases.

     While the chat is up the dock would only get in its way, and its menu sits a
     layer below the panel. It goes away and comes back with the panel, so it
     must not be tabbed into meanwhile.

     Under the cookie banner on a phone, until it is answered. There the banner
     is a card across the bottom of the screen, on top of the dock, so a press
     aimed at Contact Us lands on the banner, and a tab stop here would be a
     button nobody can see. The dock stays where it is and looks the same,
     except WhatsApp, which fades out: above a short card it could stand clear,
     a button that does nothing when pressed. The navbar carries WhatsApp
     meanwhile. From md the banner keeps to 8 of the 12 columns on the left,
     the dock stands clear of it, and it stays awake.

     `inert` goes on the inner element, not on the <aside>. The aside is a child
     of <body>, which lib/backgroundInert.ts sets and clears by hand behind the
     popups and the phone menu, and clearing it there would wake a dock that
     should still be asleep. aria-hidden takes the empty landmark out with it. */
  const underBanner = consent === null && phone;
  const asleep = chatOpen || underBanner;

  return (
    <>
      <aside
        aria-label="Contact options"
        aria-hidden={asleep || undefined}
        className={cn(
          "fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6",
          "transition-[opacity,translate] duration-300 ease-out-expo",
          chatOpen && "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <div
          ref={dialRef}
          data-reveal
          inert={asleep}
          className="flex flex-col items-end gap-3 transition-[opacity,transform] duration-500 ease-out-expo"
          style={reveal}
        >
          {/* The wrapper carries the glide (a layout animation, so it is
              skipped under reduced motion and in agent mode); the anchor keeps
              its own press and hover, whose CSS transitions would otherwise
              fight framer-motion over `transform`. */}
          <motion.div
            layout="position"
            transition={{ duration: 0.35, ease: EASE }}
            className={cn("transition-opacity duration-300", underBanner && "opacity-0")}
          >
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener"
              onClick={() => {
                trackWhatsAppClick("Floating WhatsApp Button");
                close();
              }}
              data-contact="whatsapp"
              aria-label="WhatsApp (opens in a new tab)"
              className={cn(
                "grid size-12 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground sm:size-13",
                SHADOW,
                "transition-[scale,background-color] duration-300 ease-out-expo hover:bg-whatsapp-hover active:scale-95",
              )}
            >
              <SocialIcon name="WhatsApp" className="size-6 sm:size-[1.625rem]" />
            </a>
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.ul
                id={menuId}
                key="menu"
                aria-label="Ways to contact us"
                variants={menu}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex flex-col items-end gap-2.5"
              >
                <motion.li variants={row}>
                  <button
                    type="button"
                    onClick={openChat}
                    data-contact="chat"
                    className="group/row block rounded-full"
                  >
                    <Row
                      icon={<AssistantMark className="size-[1.125rem]" />}
                      label="Chat with us"
                      tone="text-accent-ink"
                    />
                  </button>
                </motion.li>

                {/* next/link, like every other page link, so the form opens
                    without reloading the document. */}
                <motion.li variants={row}>
                  <SiteLink
                    href={ctas.contact.href}
                    onClick={close}
                    data-contact="enquiry"
                    className="group/row block rounded-full"
                  >
                    <Row
                      icon={<PenLine aria-hidden="true" className="size-[1.125rem]" strokeWidth={1.9} />}
                      label="Enquiry"
                      tone="text-accent-ink"
                    />
                  </SiteLink>
                </motion.li>
              </motion.ul>
            )}
          </AnimatePresence>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            onClick={toggle}
            data-contact="toggle"
            className={cn(
              "flex h-12 items-center gap-2.5 rounded-full bg-action-gradient px-4 text-action-foreground sm:h-13 sm:px-5",
              SHADOW,
              "transition-transform duration-300 ease-out-expo active:scale-95",
            )}
          >
            <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center">
              {open ? (
                <X className="size-[1.375rem]" strokeWidth={2.1} />
              ) : (
                <MessageSquare className="size-[1.375rem]" strokeWidth={2} />
              )}
            </span>
            {/* The label never changes — a pill that grows to "Close contact
                options" shifts the whole dock sideways, and `aria-expanded`
                already tells a screen reader which way the button goes.
                Below 380px it crowds the edge of the screen, so there it steps
                back to the accessible name only. */}
            <span className="sr-only text-small font-semibold min-[380px]:not-sr-only">
              {ctas.contact.label}
            </span>
          </button>
        </div>
      </aside>

      {/* Nothing of the panel — its code included — exists until the first
          time someone chooses Chat with us. */}
      {chatMounted && <ChatPanelLazy open={chatOpen} onClose={closeChat} />}
    </>
  );
}

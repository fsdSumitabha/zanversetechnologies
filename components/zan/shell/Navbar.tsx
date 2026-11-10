"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Phone } from "lucide-react";
import { ctas, mainNav, office, site } from "@/constants/zan";
import { ButtonLink } from "@/components/zan/ui/Button";
import { ZanLogo } from "@/components/zan/ui/ZanLogo";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { useSiteHref } from "@/lib/useSiteHref";
import { cn } from "@/lib/utils";
import { FloatingActions } from "./FloatingActions";
import { MegaMenu, MegaMenuLinks } from "./MegaMenu";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";
import { useLogoHref, usePreloaded } from "./shellStore";

/* ── Scroll state ─────────────────────────────────────────────────────────────
   One passive listener shared by every subscriber; the snapshot is a boolean:
   has the page moved past 24px (solid bar).

   The bar NEVER hides on scroll. It used to slide away while reading down,
   and on this page that mostly happened inside pinned scenes (the dial, the
   showreel, the services deck), where scrolling down does not move the page
   and the reader lost the one fixed thing to orient by: on a phone the top of
   the deck read as the page slipping behind the screen. A 72px bar is a small
   price for a header that is always there. */

const SOLID_AT = 24;

let navScrolled = false;
const navListeners = new Set<() => void>();

function readScroll() {
  const next = window.scrollY > SOLID_AT;
  if (next !== navScrolled) {
    navScrolled = next;
    navListeners.forEach((l) => l());
  }
}

function subscribeScroll(onChange: () => void) {
  if (navListeners.size === 0) {
    navScrolled = window.scrollY > SOLID_AT;
    window.addEventListener("scroll", readScroll, { passive: true });
  }
  navListeners.add(onChange);
  return () => {
    navListeners.delete(onChange);
    if (navListeners.size === 0) window.removeEventListener("scroll", readScroll);
  };
}

function useNavScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => navScrolled,
    () => false,
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────────── */

const HOVER_OPEN_MS = 110;
const HOVER_CLOSE_MS = 220;

/** The tab for the page being read, and for every page under it, so a service
    page (/services/web-development) keeps Services lit. */
const onPath = (pathname: string | null, href: string) => {
  const here = pathname || "/";
  return href !== "/" && (here === href || here.startsWith(`${href}/`));
};

/**
 * The company bar, in three parts that balance on a 1fr / auto / 1fr grid
 * from 1280px: the logo (the top of the homepage, from any page) on the left,
 * the tabs in the middle (pages of this site; Services is a link to its page
 * and also opens the mega menu, on hover or from its chevron), and on the
 * right the Dubai office's phone and "Contact Us". Below 1280px the tabs fold
 * into the full-screen mobile menu, and below 1024px the number becomes a
 * round tap-to-call button beside the menu toggle. It also mounts the floating
 * contact buttons.
 *
 * Transparent at the very top of the page; from the first 24px of scroll it
 * sits on a solid light ground with a hairline, and it stays on screen the
 * whole way down (see the scroll state above). It drops in once the preloader
 * has left.
 */
export function Navbar() {
  const href = useSiteHref();
  const logoHref = useLogoHref();
  const pathname = usePathname();
  const entered = usePreloaded();
  const scrolled = useNavScrolled();

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const focusFirstOnOpen = useRef(false);

  const megaId = useId();
  const mobileId = useId();

  const solid = scrolled || megaOpen;

  /* Mega menu: hover intent (mouse only — a touch "hover" is followed by a
     click, which would toggle straight back shut). */
  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const hoverOpen = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (megaOpen) return;
    openTimer.current = window.setTimeout(() => {
      hoverOpenedAt.current = performance.now();
      setMegaOpen(true);
    }, HOVER_OPEN_MS);
  };
  const hoverClose = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), HOVER_CLOSE_MS);
  };
  const closeMega = useCallback((returnFocus = false) => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    // Back to the chevron, the control that opens the menu, so Enter, Space and
    // the arrows work on it as they did on the one Services button. Only when
    // focus was in the menu or nowhere: an Escape that shuts a menu opened by
    // hover must not take focus out of a field someone is typing in.
    const item = triggerRef.current?.closest("li");
    const focused = document.activeElement;
    const fromMenu = !!item && (focused === document.body || item.contains(focused));
    setMegaOpen(false);
    if (returnFocus && fromMenu) triggerRef.current?.focus();
  }, []);

  const onTriggerClick = () => {
    clearTimers();
    // A click that lands just after hover opened the menu means "open", not
    // "toggle shut".
    if (megaOpen && performance.now() - hoverOpenedAt.current < 450) return;
    setMegaOpen((v) => !v);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusFirstOnOpen.current = true;
      if (megaOpen) panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
      else setMegaOpen(true);
    }
  };

  // Focus leaving the Services item (word, chevron and panel) closes the menu.
  const onServicesBlur = (e: FocusEvent<HTMLLIElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    if (next) closeMega();
  };

  // While the mega menu is open: Escape, an outside press and scrolling close it.
  useEffect(() => {
    if (!megaOpen) return;
    if (focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }
    const openedAtY = window.scrollY;
    const onKey = (e: globalThis.KeyboardEvent) => {
      // Not an Escape that another layer has handled, or one meant for an
      // overlay opened over the header, which has made the header inert.
      if (e.key !== "Escape" || e.defaultPrevented || headerRef.current?.closest("[inert]")) return;
      closeMega(true);
    };
    const onDown = (e: globalThis.PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeMega();
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAtY) > 40) closeMega();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [megaOpen, closeMega]);

  useEffect(() => clearTimers, []);

  const closeMobile = useCallback((opts?: { restoreFocus?: boolean }) => {
    setMobileOpen(false);
    if (opts?.restoreFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  const tabClass = (isOpen: boolean) =>
    cn(
      "group/tab relative inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-small font-medium tracking-[-0.01em] transition-colors duration-300",
      isOpen ? "text-foreground" : "text-muted hover:text-foreground",
    );

  // Hover wipe: in from the left, out to the right. Held while the mega
  // menu is open, so the tab it belongs to stays marked. A tab that is one link
  // takes focus itself (group-focus-visible); on the Services pill focus lands on
  // one of its two parts, which are this line's earlier siblings (peer).
  const underline = (held: boolean) => (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-3.5 bottom-1 h-[1.5px] rounded-full bg-accent-ink",
        "transition-[scale] duration-500 ease-out-expo",
        held
          ? "origin-left scale-x-100"
          : "origin-right scale-x-0 group-hover/tab:origin-left group-hover/tab:scale-x-100 group-focus-visible/tab:origin-left group-focus-visible/tab:scale-x-100 peer-focus-visible:origin-left peer-focus-visible:scale-x-100",
      )}
    />
  );

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 h-nav"
      >
        {/* The ground is its own layer so it can fade in without fading the
            bar's content. Solid, not frosted: over the pinned scenes a
            translucent bar let the half-scrolled content under it read
            through, as if the page had slid behind the header. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 border-b border-border bg-surface-raised shadow-nav",
            "transition-opacity duration-500 ease-smooth",
            solid ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          data-reveal
          className="h-full transition-[opacity,transform] duration-700 ease-out-expo"
          // The short delay lands the drop-in as the preloader's panel clears
          // the top of the screen.
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(-18px)",
            transitionDelay: entered ? "0.2s" : "0s",
          }}
        >
          <div className="container-zan flex h-full items-center justify-between gap-3 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-6">
            <SiteLink
              href={logoHref}
              aria-label={`${site.name} home`}
              className="-ml-1 inline-flex shrink-0 items-center rounded-lg p-1 transition-opacity duration-300 hover:opacity-75"
            >
              <ZanLogo eager className="h-7 sm:h-8" />
            </SiteLink>

            <nav aria-label="Primary" className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {mainNav.map((item) => {
                  const active = onPath(pathname, item.href);
                  if (item.sections?.length) {
                    return (
                      <li
                        key={item.label}
                        onPointerEnter={hoverOpen}
                        onPointerLeave={hoverClose}
                        onBlur={onServicesBlur}
                      >
                        {/* One pill, two controls, painted as the single button
                            it used to be.

                            The word is a real link. Its ::after stretches it
                            over the whole pill, so a click anywhere but the
                            chevron goes to the page. The link is not positioned,
                            so that ::after measures against this pill, and its
                            own outline is off: the ring goes on the ::after,
                            which is the pill's box, so it has the pill's shape,
                            size and colour fade.

                            The chevron is its own button, on top of that stretch
                            by being positioned and later in the DOM. Its box is
                            24 by 24 around the 14px icon, for the hit area, and
                            the negative margin hands the extra 10px back, so the
                            word, the gap and the icon sit where they always did. */}
                        {/* The ring is the pill's, drawn while either part has keyboard
                            focus: the outline the one Services button had, 2px and
                            3px out, round the whole pill. */}
                        <span
                          className={cn(
                            tabClass(megaOpen || active),
                            "has-[:focus-visible]:[outline:2px_solid_var(--color-focus)] has-[:focus-visible]:[outline-offset:3px]",
                          )}
                        >
                          <SiteLink
                            href={item.href}
                            onClick={() => closeMega()}
                            aria-current={active ? (pathname === item.href ? "page" : "true") : undefined}
                            className="peer focus-visible:outline-none after:absolute after:inset-0 after:rounded-full"
                          >
                            {item.label}
                          </SiteLink>
                          <button
                            ref={triggerRef}
                            type="button"
                            aria-label={`${item.label} menu`}
                            aria-expanded={megaOpen}
                            aria-controls={megaOpen ? megaId : undefined}
                            onClick={onTriggerClick}
                            onKeyDown={onTriggerKeyDown}
                            className="peer relative -m-[5px] grid size-6 shrink-0 place-items-center rounded-full focus-visible:outline-none"
                          >
                            <ChevronDown
                              aria-hidden="true"
                              className={cn(
                                "size-3.5 shrink-0 transition-transform duration-500 ease-out-expo",
                                megaOpen && "rotate-180",
                              )}
                            />
                          </button>
                          {underline(megaOpen || active)}
                        </span>
                        <MegaMenu
                          ref={panelRef}
                          id={megaId}
                          open={megaOpen}
                          onChoose={() => closeMega()}
                          onPointerEnter={() => window.clearTimeout(closeTimer.current)}
                          onPointerLeave={hoverClose}
                        />
                        <MegaMenuLinks />
                      </li>
                    );
                  }
                  return (
                    <li key={item.label}>
                      <SiteLink
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={tabClass(active)}
                      >
                        {item.label}
                        {underline(active)}
                      </SiteLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {/* Both phone links report the number itself as their
                  contact_click label (ContactClicks), whatever they say. */}
              <a
                href={`tel:${office.phoneTel}`}
                data-analytics-label={office.phoneDisplay}
                className="hidden h-10 items-center gap-2 rounded-full px-2 text-small font-medium whitespace-nowrap text-muted transition-colors duration-300 hover:text-accent-ink lg:inline-flex"
              >
                <Phone aria-hidden="true" className="size-4 shrink-0 text-accent-ink" />
                <span className="sr-only">Call the {office.city} office: </span>
                <span className="tabular-nums">{office.phoneDisplay}</span>
              </a>{" "}
              <ButtonLink href={href(ctas.contact.href)} className="hidden sm:inline-flex">
                {ctas.contact.label}
              </ButtonLink>
              <a
                href={`tel:${office.phoneTel}`}
                aria-label={`Call the ${office.city} office: ${office.phoneDisplay}`}
                data-analytics-label={office.phoneDisplay}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors duration-300 hover:border-border-strong hover:text-accent-ink lg:hidden"
              >
                <Phone aria-hidden="true" className="size-[1.125rem]" />
              </a>
              <MenuToggle
                ref={toggleRef}
                open={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                controls={mobileId}
                className="xl:hidden"
              />
            </div>
          </div>
        </div>

        {/* With JavaScript off the menu button does nothing, and below 1280px
            the tabs are hidden, so this plain row is the way around. It exists
            only then: with JavaScript on the browser never builds it. */}
        <noscript>
          <nav
            aria-label="Menu"
            className="absolute inset-x-0 top-full border-b border-border bg-surface-raised xl:hidden"
          >
            <ul className="container-zan flex flex-wrap gap-x-5 text-small font-medium text-foreground">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="inline-flex min-h-11 items-center">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={ctas.contact.href} className="inline-flex min-h-11 items-center">
                  {ctas.contact.label}
                </a>
              </li>
            </ul>
          </nav>
        </noscript>
      </header>

      <MobileMenu open={mobileOpen} id={mobileId} onClose={closeMobile} />
      <FloatingActions />
    </>
  );
}

"use client";

import {
  createElement,
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type TransitionEvent,
} from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { FAQ } from "@/constants/zan";
import { holdTarget } from "@/components/zan/shell/holdTarget";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The answer panel's grid-template-rows transition: duration-500 below. */
const PANEL_MS = 500;

/** How long past the end of a transition to wait for a transitionend that may never come. */
const END_GRACE_MS = 150;

const noopSubscribe = () => () => {};

/** Panels already held in view after a find before hydration (useFindablePanel). */
const held = new WeakSet<Element>();

/** Without hidden="until-found", a browser reads the attribute as plain `hidden`. */
const browserFindsHidden = () => "onbeforematch" in document.body;

/**
 * hidden="until-found": hidden, but the browser's find can reach the words, and
 * opens them when it does.
 *
 * React cannot write that on an ordinary element. It treats `hidden` as a
 * boolean there, so the HTML gets `hidden=""`, which is display: none. It writes
 * the props of a custom element as given, on the server too, so this is one. It
 * is never defined: to the browser it is a plain box with an unfamiliar name.
 *
 * `block` because an unknown element is inline, and content-visibility, which is
 * how the browser hides it, does not apply to an inline box. It also keeps the
 * box rendered in a browser that reads the attribute as plain `hidden`, where
 * the panel's own 0fr is what keeps it out of sight until hydration.
 *
 * Put it inside the element that transitions, never on it or around it. Nothing
 * inside it has a style until it is shown, so a fade set on an element in here
 * would have no value to start from and would not run.
 */
export function UntilFound({
  hidden,
  className,
  children,
}: {
  hidden: boolean;
  className?: string;
  children: ReactNode;
}) {
  return createElement(
    "zan-until-found",
    // The browser's find removes the attribute itself, before hydration if it
    // runs first, which is expected rather than a mismatch.
    { className: cn("block", className), hidden: hidden ? "until-found" : false, suppressHydrationWarning: true },
    children,
  );
}

/**
 * What a collapsing panel needs so that, once shut, its content can be found.
 *
 * content-visibility: hidden takes effect at once, so if it went on as the panel
 * started to close, the height would jump and the closing transition would be
 * cut off. So it goes on only when that transition has ended, and comes off in
 * the same commit that starts an opening one. While a panel is closing it is
 * inert, as it would be at rest if the browser cannot find hidden text.
 *
 * `transitionend` says when it has ended. The timer is for when it never fires:
 * a transition that was cancelled, or a browser that cannot animate
 * grid-template-rows. Reduced motion is not one of those: globals.css keeps a
 * 0.01ms transition, which still ends.
 *
 * `onFound` runs when the browser's find opens the content. It must be stable.
 * React has no onBeforeMatch, so the event is listened for here; it bubbles, and
 * the browser has already removed the attribute by the time the state follows.
 * A find that ran before hydration is caught when the panel mounts.
 */
export function useFindablePanel(open: boolean, transitionMs: number, onFound: () => void) {
  // True on the server and through hydration, so closed panels always carry the
  // attribute in the HTML. A browser without the feature drops it right after.
  const findable = useSyncExternalStore(noopSubscribe, browserFindsHidden, () => true);
  const [settled, setSettled] = useState(!open);

  // During render, not in an effect: the commit that starts the close must
  // already know the panel is not settled.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setSettled(false);
  }

  useEffect(() => {
    if (open || settled) return;
    const timer = window.setTimeout(() => setSettled(true), transitionMs + END_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [open, settled, transitionMs]);

  const hidden = !open && settled && findable;

  const attach = useCallback(
    (panel: HTMLDivElement) => {
      panel.addEventListener("beforematch", onFound);
      // A find that ran before hydration, such as a #:~:text= link opened cold,
      // fired beforematch before this listener was here, and removed the
      // attribute, which the server HTML puts on every closed panel. So a box
      // that should carry it here and does not was opened by that find. The
      // scroll scenes then move the answer away from where the browser scrolled,
      // so it is held in view as a section link is. Not a box whose found answer
      // sits in a box inside it: that one is held instead.
      const box = hidden ? panel.querySelector("zan-until-found") : null;
      if (box && !box.hasAttribute("hidden")) {
        onFound();
        if (!held.has(panel) && !box.querySelector("zan-until-found:not([hidden])")) {
          held.add(panel);
          holdTarget(() => panel.parentElement, { ignoreTransforms: true });
        }
      }
      return () => panel.removeEventListener("beforematch", onFound);
    },
    [onFound, hidden],
  );

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (!open && e.target === e.currentTarget && e.propertyName === "grid-template-rows") setSettled(true);
  };

  return {
    /** The panel's ref callback. */
    attach,
    /** For the panel. */
    onTransitionEnd,
    /** For the panel. */
    inert: !open && !(settled && findable),
    /** For UntilFound, around what the panel holds. */
    hidden,
  };
}

function FaqRow({
  item,
  index,
  number,
  panelId,
  isOpen,
  setOpen,
}: {
  item: FAQ;
  index: number;
  /** As shown: "01". */
  number: string;
  panelId: string;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<number | null>>;
}) {
  const onFound = useCallback(() => setOpen(index), [setOpen, index]);
  const { attach, onTransitionEnd, inert, hidden } = useFindablePanel(isOpen, PANEL_MS, onFound);

  return (
    <motion.li
      data-reveal
      className="scroll-mt-nav border-b border-border"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: Math.min(index, 4) * 0.05 }}
    >
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen((cur) => (cur === index ? null : index))}
          className="group flex w-full items-start gap-4 py-6 text-left sm:gap-6 sm:py-7"
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-1.5 w-7 shrink-0 font-mono text-eyebrow uppercase transition-colors duration-300",
              isOpen ? "text-accent-ink" : "text-subtle",
            )}
          >
            {number}
          </span>{" "}
          <span className="flex-1 text-h3 text-foreground transition-colors duration-300 group-hover:text-accent-ink">
            {item.question}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-out-expo",
              isOpen
                ? "rotate-45 border-transparent bg-accent text-accent-foreground"
                : "border-border-strong bg-surface text-foreground group-hover:border-foreground",
            )}
          >
            <Plus className="size-4" strokeWidth={2} />
          </span>
        </button>
      </h3>
      {/* zan-faq-panel is what the noscript rule in the layouts opens. */}
      <div
        ref={attach}
        id={panelId}
        inert={inert}
        onTransitionEnd={onTransitionEnd}
        className="zan-faq-panel grid transition-[grid-template-rows] duration-500 ease-out-expo"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className={cn(
              "max-w-[64ch] pb-7 pl-11 text-body text-muted transition-[opacity,translate] duration-500 ease-out-expo sm:pr-16 sm:pl-13",
              isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
            )}
          >
            <UntilFound hidden={hidden}>{item.answer}</UntilFound>
          </p>
        </div>
      </div>
    </motion.li>
  );
}

/**
 * One open at a time, the first open to start with. Every answer is in the DOM
 * from the server render: a closed panel collapses to `0fr` and its answer is
 * hidden="until-found", so it stays indexable and the browser's find can open
 * it, without being read or tabbed into while shut.
 *
 * `numberFrom` is for a list that continues one shown above it, which is also
 * the case for `startClosed`: the visitor has just opened it to scan the
 * questions, and has not asked for any one answer yet.
 */
export function FaqAccordion({
  items,
  numberFrom = 1,
  startClosed = false,
}: {
  items: readonly FAQ[];
  numberFrom?: number;
  startClosed?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(startClosed ? null : 0);
  const base = useId();

  return (
    <ul className="border-t border-border">
      {items.map((item, i) => (
        <FaqRow
          key={item.question}
          item={item}
          index={i}
          number={String(i + numberFrom).padStart(2, "0")}
          panelId={`${base}-a-${i}`}
          isOpen={open === i}
          setOpen={setOpen}
        />
      ))}
    </ul>
  );
}

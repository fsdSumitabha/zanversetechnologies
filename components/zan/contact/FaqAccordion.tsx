"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { FAQ } from "@/constants/zan";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One open at a time, the first open to start with. Every answer is in the
 * DOM from the server render: a closed panel collapses to `0fr` and is made
 * inert, so it stays indexable without being read or tabbed into while shut.
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
      {items.map((item, i) => {
        const isOpen = open === i;
        const qId = `${base}-q-${i}`;
        const aId = `${base}-a-${i}`;
        return (
          <motion.li
            key={item.question}
            data-reveal
            className="border-b border-border"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 4) * 0.05 }}
          >
            <h3>
              <button
                id={qId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={aId}
                onClick={() => setOpen((cur) => (cur === i ? null : i))}
                className="group flex w-full items-start gap-4 py-6 text-left sm:gap-6 sm:py-7"
              >
                <span
                  className={cn(
                    "mt-1.5 w-7 shrink-0 font-mono text-eyebrow uppercase transition-colors duration-300",
                    isOpen ? "text-accent-ink" : "text-subtle",
                  )}
                >
                  {String(i + numberFrom).padStart(2, "0")}
                </span>
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
            <div
              id={aId}
              role="region"
              aria-labelledby={qId}
              inert={!isOpen}
              className="grid transition-[grid-template-rows] duration-500 ease-out-expo"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p
                  className={cn(
                    "max-w-[64ch] pb-7 pl-11 text-body text-muted transition-[opacity,translate] duration-500 ease-out-expo sm:pr-16 sm:pl-13",
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                  )}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

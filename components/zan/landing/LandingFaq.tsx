"use client";

import { useCallback, useId, useState } from "react";
import { Plus } from "lucide-react";
import { FaqAccordion, UntilFound, useFindablePanel } from "@/components/zan/contact/FaqAccordion";
import { Reveal } from "@/components/zan/page/Reveal";
import { Button } from "@/components/zan/ui/Button";
import { landingCopy, type splitFaqs } from "@/constants/landing";
import { cn } from "@/lib/utils";
import { useQuote } from "./quoteContext";

/** The tab's grid-template-rows transition: duration-700 below. */
const PANEL_MS = 700;

/**
 * Two questions answered on the page, the rest behind one tab.
 *
 * The two are the ones a buyer actually arrives with, what it costs and how long
 * it takes, and they are always open: there is no reason to make anyone click
 * for those. Everything else stays one press away and out of the way of the
 * form below. Every answer is in the DOM from the server render either way; the
 * closed tab collapses to `0fr` and what it holds is hidden="until-found", so
 * nothing in it can be tabbed into while it is shut, and the browser's find can
 * still reach it and open it.
 *
 * NO FAQPage MARKUP. The same questions are marked up on the service page, which
 * is the URL that should rank for them.
 */
export function LandingFaq({ faqs }: { faqs: ReturnType<typeof splitFaqs> }) {
  const { faq } = landingCopy;
  const { ask } = useQuote();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const onFound = useCallback(() => setOpen(true), []);
  const { attach, onTransitionEnd, inert, hidden } = useFindablePanel(open, PANEL_MS, onFound);

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {faqs.featured.map((item, i) => (
          <Reveal key={item.question} delay={i * 0.06} className="h-full">
            <article className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-lift sm:p-8">
              <span className="font-mono text-eyebrow text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-h3 text-foreground">{item.question}</h3>
              <p className="mt-3.5 text-body text-muted">{item.answer}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-5">
        <div className="scroll-mt-nav overflow-hidden rounded-3xl border border-border bg-surface">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8 sm:py-6"
          >
            <span className="text-h3 text-foreground transition-colors duration-300 group-hover:text-accent-ink">
              {open ? faq.less : faq.more(faqs.rest.length)}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-out-expo",
                open
                  ? "rotate-45 border-transparent bg-accent text-accent-foreground"
                  : "border-border-strong bg-surface text-foreground group-hover:border-foreground",
              )}
            >
              <Plus className="size-4" strokeWidth={2} />
            </span>
          </button>

          {/* zan-faq-panel is what the noscript rule in the layout opens. */}
          <div
            ref={attach}
            id={panelId}
            inert={inert}
            onTransitionEnd={onTransitionEnd}
            className="zan-faq-panel grid transition-[grid-template-rows] duration-700 ease-out-expo"
            style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <UntilFound hidden={hidden} className="px-6 pb-2 sm:px-8">
                <FaqAccordion items={faqs.rest} numberFrom={faqs.featured.length + 1} startClosed />
              </UntilFound>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-7 text-center">
        <p className="text-body text-muted">
          {faq.still}{" "}
          <Button
            variant="ghost"
            arrow={false}
            onClick={() => ask({ location: "faq" })}
            className="h-auto align-baseline font-semibold text-accent-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
          >
            {faq.ask}
          </Button>
          . {faq.reply}
        </p>
      </Reveal>
    </>
  );
}

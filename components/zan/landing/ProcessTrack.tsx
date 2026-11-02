"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMediaQuery } from "@/components/zan/shell/shellStore";
import { processSteps, type ProcessStep } from "@/constants/zan";
import { MQ } from "@/lib/gsap";

/** The numbered node a step hangs from. It fills gold as the line reaches it. */
function Node({
  index,
  at,
  progress,
  still,
}: {
  index: string;
  at: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const fill = useTransform(progress, [at - 0.03, at + 0.03], [0, 1]);
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong bg-bg font-mono text-[0.8125rem] text-ink">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 bg-brand-gradient"
        style={{ opacity: still ? 1 : fill }}
      />
      <span className="relative">{index}</span>
    </span>
  );
}

function Step({
  step,
  at,
  progress,
  still,
}: {
  step: ProcessStep;
  at: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 xl:block">
      <Node index={step.index} at={at} progress={progress} still={still} />
      <div className="xl:mt-6 xl:pr-3">
        <h3 className="pt-2 font-display text-h3 font-semibold text-ink xl:pt-0">{step.title}</h3>
        <p className="mt-2.5 max-w-[60ch] text-small text-ink-2">{step.description}</p>
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
          {step.deliverables.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-small text-ink">
              <span aria-hidden="true" className="mt-[0.5625rem] size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * The four stages on one line that fills with gold as the section passes, so a
 * promise of "no surprises" is also something that visibly proceeds. Across the
 * page from xl, down the left edge below that. For reduced motion the line is
 * simply full and every node lit, with nothing tied to the scroll.
 */
export function ProcessTrack() {
  const root = useRef<HTMLOListElement>(null);
  const still = useMediaQuery(MQ.reduce);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start 82%", "end 68%"] });
  const count = processSteps.length;

  return (
    <ol ref={root} className="relative mt-12 grid gap-y-10 sm:mt-14 xl:grid-cols-4 xl:gap-x-8">
      {/* Down the left, through the nodes' centres. */}
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.34375rem] w-px bg-line-strong xl:hidden" />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[1.28125rem] w-[3px] origin-top rounded-full bg-brand-gradient xl:hidden"
        style={{ scaleY: still ? 1 : scrollYProgress }}
      />
      {/* Across the top, from xl. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-[1.34375rem] hidden h-px bg-line-strong xl:block" />
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-[1.28125rem] hidden h-[3px] origin-left rounded-full bg-brand-gradient xl:block"
        style={{ scaleX: still ? 1 : scrollYProgress }}
      />

      {processSteps.map((step, i) => (
        <Step key={step.id} step={step} at={i / count} progress={scrollYProgress} still={still} />
      ))}
    </ol>
  );
}

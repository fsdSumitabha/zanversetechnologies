"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { CountUp } from "@/components/zan/board/CountUp";
import { useMediaQuery } from "@/components/zan/shell/shellStore";
import { MQ } from "@/lib/gsap";

/** A published figure that counts up the first time it comes into view. */
export function CountFigure({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const motion = useMediaQuery(MQ.motion);
  return (
    <span ref={ref}>
      <CountUp value={value} run={seen} armed={motion} className={className} />
    </span>
  );
}

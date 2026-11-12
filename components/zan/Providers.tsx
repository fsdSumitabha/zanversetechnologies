"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useAgentMode } from "@/components/zan/shell/shellStore";

/**
 * reducedMotion="user": for a visitor who prefers reduced motion, every
 * framer-motion transform and layout animation is skipped (opacity still
 * fades). GSAP scenes gate themselves with gsap.matchMedia(MQ.motion).
 * An agent (lib/agentMode.ts) gets "always", the same reduced motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  const agent = useAgentMode();
  return <MotionConfig reducedMotion={agent ? "always" : "user"}>{children}</MotionConfig>;
}

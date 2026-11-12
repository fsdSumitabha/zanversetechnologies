"use client";

import { useSyncExternalStore } from "react";
import { isMotionPaused, subscribeMotionPause } from "@/lib/motionPause";

/**
 * Whether the visitor has asked for animations to stop. `false` on the server
 * and during hydration, so server and client agree on the first render.
 */
export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotionPause, isMotionPaused, () => false);
}

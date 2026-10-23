"use client";

import { useSyncExternalStore } from "react";
import { getConsent, subscribeConsent, type Consent } from "@/lib/consent";

/**
 * The visitor's cookie choice, re-rendering when it changes: `null` until they
 * have made one, and `undefined` while rendering on the server, which cannot
 * know. Hydration renders `undefined` too, so neither the banner nor a tag
 * ever acts on a guess.
 *
 * Its own module, with "use client", so lib/consent.ts stays importable from
 * server components.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribeConsent, getConsent, () => undefined);
}

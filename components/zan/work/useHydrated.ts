import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False on the server and during hydration, true from the next render on. For
 * what only the browser needs, such as a marquee's decorative copies: the server
 * HTML leaves it out, and the first client render matches the server's.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

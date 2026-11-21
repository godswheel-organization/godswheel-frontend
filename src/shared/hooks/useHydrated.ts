import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false while React hydrates server HTML (and on the server), true from then on. For UI that depends on
// browser-only state: render the server's version first so hydration matches, then the real one.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

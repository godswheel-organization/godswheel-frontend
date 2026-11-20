"use client";

import { useEffect } from "react";
import { SPLASH_ATTRIBUTE, SPLASH_EXIT_MS, SPLASH_MIN_MS, SPLASH_SEEN_KEY } from "./splashConfig";

// Fades the splash out once the app has loaded and come to life (this effect runs after hydration),
// but not before it has been up for SPLASH_MIN_MS.
export default function LaunchSplashDismiss() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute(SPLASH_ATTRIBUTE)) return;

    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      // Storage blocked: the splash may show again on the next full load, which is harmless.
    }

    let removeTimer: ReturnType<typeof setTimeout> | undefined;
    // performance.now() counts from the start of the page load, so slow loads don't add extra waiting.
    const leaveTimer = setTimeout(() => {
      root.setAttribute(SPLASH_ATTRIBUTE, "leaving");
      removeTimer = setTimeout(() => root.removeAttribute(SPLASH_ATTRIBUTE), SPLASH_EXIT_MS);
    }, Math.max(0, SPLASH_MIN_MS - performance.now()));

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return null;
}

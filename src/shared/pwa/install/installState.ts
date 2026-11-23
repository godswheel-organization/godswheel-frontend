import { useSyncExternalStore } from "react";
import { env } from "@/lib/env";
import { currentInstallPlatform, type InstallPlatform } from "./platform";

// One shared picture of "can this visitor install GodsWheel, and what have they said so far", read by the install
// toast, the install guide and the landing page's timed guide.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Set once installed through the browser's own prompt (localStorage: this browser, for good).
const INSTALLED_KEY = "godswheel_pwa_installed";
// Closing the toast (or cancelling the browser's install dialog) hides it for this visit only (sessionStorage).
const TOAST_DISMISSED_KEY = "godswheel_install_toast_dismissed";
// The landing page opens the guide once per visit (sessionStorage). There's deliberately no "don't show again":
// the aim is for every visitor to install.
const GUIDE_SHOWN_KEY = "godswheel_install_guide_shown";

export interface InstallState {
  // False on the server, during hydration, and in local development unless PWA mode is on (npm run dev:pwa).
  ready: boolean;
  platform: InstallPlatform;
  // The browser's own install dialog, when it offers one (Chromium browsers). Usable once.
  nativePrompt: BeforeInstallPromptEvent | null;
  installed: boolean;
  toastDismissed: boolean;
  guideOpen: boolean;
}

const SERVER_STATE: InstallState = {
  ready: false,
  platform: "unsupported",
  nativePrompt: null,
  installed: false,
  toastDismissed: false,
  guideOpen: false,
};

let state = SERVER_STATE;
const listeners = new Set<() => void>();

function update(patch: Partial<InstallState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

// Storage can be blocked (private windows, strict settings): then nothing is remembered, which is harmless here.
function read(storage: "local" | "session", key: string) {
  try {
    return (storage === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function write(storage: "local" | "session", key: string, value: string | null) {
  try {
    const store = storage === "local" ? localStorage : sessionStorage;
    if (value === null) store.removeItem(key);
    else store.setItem(key, value);
  } catch {
    // See read().
  }
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

// Chromium browsers announce when the app can be installed (beforeinstallprompt). There, no announcement means
// it's installed already or can't be yet, so nothing is offered until it comes.
const hasNativePrompt = () => "onbeforeinstallprompt" in window;

let started = false;
function start() {
  if (started) return;
  started = true;
  if (process.env.NODE_ENV === "development" && !env.NEXT_PUBLIC_ENABLE_PWA) return;

  state = {
    ...state,
    ready: true,
    platform: currentInstallPlatform(),
    installed: isStandalone() || read("local", INSTALLED_KEY) === "1",
    toastDismissed: read("session", TOAST_DISMISSED_KEY) === "1",
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    // Offered again, so it isn't installed (any more): forget an old "installed" mark.
    write("local", INSTALLED_KEY, null);
    update({ nativePrompt: event as BeforeInstallPromptEvent, installed: false });
  });
  window.addEventListener("appinstalled", () => {
    write("local", INSTALLED_KEY, "1");
    update({ installed: true, nativePrompt: null, guideOpen: false });
  });
}

// Listening starts as soon as this module loads in the browser, so an early beforeinstallprompt isn't missed.
if (typeof window !== "undefined") start();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );
}

// Whether there's anything to offer this visitor: not installed, on a browser that can install, and (where the
// browser announces it) actually installable right now.
export function canOfferInstall(current: InstallState): boolean {
  if (!current.ready || current.installed || current.platform === "unsupported") return false;
  // iPhones and iPads never offer a native install, so they always get the steps. (Also lets Chrome's iPhone
  // emulation in DevTools show the iPhone flow, though Chrome itself has beforeinstallprompt.)
  return current.nativePrompt !== null || current.platform === "ios" || !hasNativePrompt();
}

// The browser's own install dialog where there is one; otherwise the step-by-step guide.
export async function startInstall(): Promise<void> {
  const prompt = state.nativePrompt;
  if (!prompt) {
    update({ guideOpen: true });
    return;
  }
  update({ nativePrompt: null, guideOpen: false });
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  if (outcome === "accepted") {
    write("local", INSTALLED_KEY, "1");
    update({ installed: true });
  } else {
    dismissInstallToast();
  }
}

export function openInstallGuide() {
  update({ guideOpen: true });
}

export function closeInstallGuide() {
  update({ guideOpen: false });
}

export function dismissInstallToast() {
  write("session", TOAST_DISMISSED_KEY, "1");
  update({ toastDismissed: true });
}

// The landing page's timed guide: once per visit.
export function shouldAutoOpenGuide(): boolean {
  return read("session", GUIDE_SHOWN_KEY) !== "1";
}

export function markGuideAutoOpened() {
  write("session", GUIDE_SHOWN_KEY, "1");
}


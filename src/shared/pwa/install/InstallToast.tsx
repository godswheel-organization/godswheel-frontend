"use client";

import Image from "next/image";
import { Download, X } from "lucide-react";
import { canOfferInstall, dismissInstallToast, startInstall, useInstallState } from "./installState";

// The small "Install GodsWheel" card, on phones and computers alike, for anyone who can install and hasn't.
// Install opens the browser's own dialog where there is one, or the step-by-step guide (iPhone, Mac Safari).
// Closing it only hides it for this visit; it's back next time.
export default function InstallToast() {
  const install = useInstallState();
  if (!canOfferInstall(install) || install.toastDismissed || install.guideOpen) return null;

  const onComputer = install.platform === "desktop-chromium" || install.platform === "mac-safari";

  return (
    <aside
      aria-label="Install GodsWheel"
      // A slim pill under the header, only as wide as its contents, at the right.
      className="fixed right-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-40 flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-full  bg-surface/90 py-2 pl-1.5 pr-1.5  backdrop-blur-md motion-safe:animate-toast-in sm:right-4"
    >
      <Image src="/icons/pwa/icon-192x192.png" alt="" width={36} height={36} className="size-9 shrink-0 rounded-full" />
      <p className="min-w-0 truncate text-sm leading-tight">
        <span className="font-semibold text-foreground">
          Get the <span className="hidden sm:inline">GodsWheel </span>app
        </span>
        {/* The why, from sm up, where there's room for it. */}
        <span className="hidden text-xs text-muted sm:block">
          {onComputer ? "Its own window, one click away" : "Free, one tap from your home screen"}
        </span>
      </p>
      <button
        type="button"
        onClick={() => void startInstall()}
        className="relative flex h-9 shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-brand-500 px-4 text-sm font-semibold text-brand-950 transition hover:bg-brand-400"
      >
        <Download className="size-4" aria-hidden />
        Install
        {/* Now and then a soft shine sweeps across, to catch the eye without nagging. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/45 to-transparent opacity-0 motion-safe:animate-shine"
        />
      </button>
      <button
        type="button"
        onClick={dismissInstallToast}
        aria-label="Not now"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-raised hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>
    </aside>
  );
}

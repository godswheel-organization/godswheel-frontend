"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import Button from "@/shared/ui/button/Button";
import { env } from "@/lib/env";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_COOKIE = "godswheel_pwa_install_dismissed";
const DISMISS_MAX_AGE = 60 * 60 * 24 * 30;
const INSTALLED_STORAGE_KEY = "godswheel_pwa_installed";

const isDismissed = () =>
  document.cookie.split(";").some((c) => c.trim().startsWith(`${DISMISS_COOKIE}=`));

const setDismissed = () => {
  document.cookie = `${DISMISS_COOKIE}=1; Max-Age=${DISMISS_MAX_AGE}; Path=/; SameSite=Lax`;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isInstalled = () =>
  isStandalone() || localStorage.getItem(INSTALLED_STORAGE_KEY) === "1";

const isIOS = () => /iPad|iPhone|iPod/.test(window.navigator.userAgent);

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [manualHint, setManualHint] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    if ((isDev && !env.NEXT_PUBLIC_ENABLE_PWA) || isDismissed() || isInstalled()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_STORAGE_KEY, "1");
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    setDismissed();
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS()) setIosHint(true);
      else setManualHint(true);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem(INSTALLED_STORAGE_KEY, "1");
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 top-20 z-50 rounded-lg bg-white p-4 shadow-theme-xs ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:left-auto sm:right-4 sm:w-96"
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-1 pr-[10px]">
        <Image
          src="/icons/pwa/icon-192x192.png"
          alt=""
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        <div className="flex-1 px-2">
          <p className="text-xs font-medium text-gray-900 dark:text-white/90">
            Install Godswheel
          </p>
          {iosHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              On iPhone/iPad: tap Share, then &ldquo;Add to Home Screen&rdquo;.
            </p>
          )}
          {manualHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use your browser menu and select &ldquo;Install app&rdquo;.
            </p>
          )}
        </div>
        <Button size="sm" startIcon={<Download className="size-4" />} onClick={handleInstall}>
          Install
        </Button>
      </div>
    </aside>
  );
}

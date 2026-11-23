"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Check, Download, EllipsisVertical, MonitorDown, Share, SquarePlus } from "lucide-react";
import Button from "@/shared/ui/button/Button";
import Sheet, { SheetTitle } from "@/shared/ui/modal/Sheet";
import type { InstallPlatform } from "./platform";
import { closeInstallGuide, startInstall, useInstallState } from "./installState";

interface Step {
  icon: ReactNode;
  text: ReactNode;
}

const iconClass = "size-4";

// What to tap on each kind of device. Menu names are the browsers' own, in bold.
const GUIDES: Record<Exclude<InstallPlatform, "unsupported">, { title: string; lead: string; steps: Step[] }> = {
  ios: {
    title: "Add GodsWheel to your home screen",
    lead: "Open it in one tap, full screen, like any other app. It's free and takes a few seconds.",
    steps: [
      { icon: <Share className={iconClass} />, text: <>Tap <b>Share</b> in your browser. In Safari it&rsquo;s in the toolbar, or under the <b>⋯</b> button.</> },
      { icon: <SquarePlus className={iconClass} />, text: <>Scroll down and tap <b>Add to Home Screen</b>.</> },
      { icon: <Check className={iconClass} />, text: <>Tap <b>Add</b>. GodsWheel appears on your home screen.</> },
    ],
  },
  android: {
    title: "Add GodsWheel to your home screen",
    lead: "Open it in one tap, full screen, like any other app. It's free and takes a few seconds.",
    steps: [
      { icon: <EllipsisVertical className={iconClass} />, text: <>Tap the <b>⋮</b> menu in the top corner of your browser.</> },
      { icon: <SquarePlus className={iconClass} />, text: <>Tap <b>Install app</b> or <b>Add to Home screen</b>.</> },
      { icon: <Check className={iconClass} />, text: <>Tap <b>Install</b>. GodsWheel appears with your other apps.</> },
    ],
  },
  "desktop-chromium": {
    title: "Install GodsWheel on this computer",
    lead: "It opens in its own window, without the browser around it, one click from your dock or taskbar.",
    steps: [
      { icon: <MonitorDown className={iconClass} />, text: <>Click the <b>install</b> icon at the right end of the address bar.</> },
      { icon: <EllipsisVertical className={iconClass} />, text: <>No icon? Open the browser menu (<b>⋮</b> or <b>…</b>) and choose <b>Install GodsWheel</b> or <b>Install page as app</b>.</> },
      { icon: <Check className={iconClass} />, text: <>Click <b>Install</b>. GodsWheel opens in its own window.</> },
    ],
  },
  "mac-safari": {
    title: "Add GodsWheel to your Dock",
    lead: "It opens in its own window, without the browser around it, one click from your Dock.",
    steps: [
      { icon: <Share className={iconClass} />, text: <>In the menu bar, choose <b>File</b>, then <b>Add to Dock</b>.</> },
      { icon: <Check className={iconClass} />, text: <>Click <b>Add</b>. GodsWheel opens from your Dock like any other app.</> },
    ],
  },
};

// How to install GodsWheel on this device: the browser's own Install button where there is one, and the steps
// either way. Opened by the toast's Install button, and once per visit by the landing page.
export default function InstallGuide() {
  const install = useInstallState();
  const open = install.guideOpen && install.platform !== "unsupported";
  const guide = install.platform === "unsupported" ? null : GUIDES[install.platform];

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeInstallGuide()}>
      {guide && (
        <div className="flex flex-col">
          <Image src="/icons/pwa/icon-192x192.png" alt="" width={56} height={56} className="rounded-2xl" />
          <SheetTitle className="mt-7 pr-12 font-serif text-[20px] leading-tight text-foreground">{guide.title}</SheetTitle>
          <p className="mt-2 text-sm text-muted">{guide.lead}</p>

          {install.nativePrompt && (
            <Button
              size="lg"
              startIcon={<Download className="size-5" aria-hidden />}
              onClick={() => void startInstall()}
              className="mt-6 w-full"
            >
              Install GodsWheel
            </Button>
          )}

          <ol className="mt-6 flex flex-col gap-4" aria-label={install.nativePrompt ? "Or install it yourself" : "How to install"}>
            {guide.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-brand-500" aria-hidden>
                  {step.icon}
                </span>
                <span className="pt-1">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.text}
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={closeInstallGuide}
            className="mt-7 self-center text-sm font-medium text-muted underline underline-offset-4 transition hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      )}
    </Sheet>
  );
}

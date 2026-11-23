"use client";

import { useEffect } from "react";
import { canOfferInstall, markGuideAutoOpened, openInstallGuide, shouldAutoOpenGuide, useInstallState } from "./installState";

// Counted from the start of the page load, so the visitor has a moment with the page first.
const DELAY_MS = 3500;

// Opens the install guide on its own a few seconds after the landing page loads: once per visit, only for
// visitors who can install and haven't. Renders nothing.
export default function InstallGuideOnArrival() {
  const install = useInstallState();
  const eligible = canOfferInstall(install);

  useEffect(() => {
    if (!eligible || !shouldAutoOpenGuide()) return;
    // Chrome may only announce it's installable after a few seconds: then this opens as soon as it does.
    const timer = setTimeout(
      () => {
        markGuideAutoOpened();
        openInstallGuide();
      },
      Math.max(0, DELAY_MS - performance.now())
    );
    return () => clearTimeout(timer);
  }, [eligible]);

  return null;
}

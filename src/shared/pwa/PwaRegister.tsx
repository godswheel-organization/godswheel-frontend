"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";

// Registers public/sw.js. Mounted by the (public) route-group layout.
// Always on in production; in dev only via `npm run dev:pwa` (sets NEXT_PUBLIC_ENABLE_PWA=true).
export default function PwaRegister() {
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const pwaEnabled = !isDev || env.NEXT_PUBLIC_ENABLE_PWA;
    if (!pwaEnabled || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import PwaRegister from "@/shared/pwa/PwaRegister";
import PwaInstallBanner from "@/shared/pwa/PwaInstallBanner";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaRegister />
      <PwaInstallBanner />
      {children}
    </>
  );
}

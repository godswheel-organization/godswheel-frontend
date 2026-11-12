import type { ReactNode } from "react";
import PwaRegister from "@/shared/pwa/PwaRegister";
import PwaInstallBanner from "@/shared/pwa/PwaInstallBanner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaRegister />
      <PwaInstallBanner />
      {children}
    </>
  );
}

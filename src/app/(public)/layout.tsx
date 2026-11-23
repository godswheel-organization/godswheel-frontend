import type { ReactNode } from "react";
import PwaRegister from "@/shared/pwa/PwaRegister";
import PwaInstall from "@/shared/pwa/install/PwaInstall";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaRegister />
      <PwaInstall />
      {children}
    </>
  );
}

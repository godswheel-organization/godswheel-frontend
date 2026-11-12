import type { Metadata } from "next";
import LegalScreen from "@/features/legal/components/LegalScreen";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyNoticePage() {
  return <LegalScreen show="privacy" />;
}

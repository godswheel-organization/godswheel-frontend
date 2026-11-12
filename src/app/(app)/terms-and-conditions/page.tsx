import type { Metadata } from "next";
import LegalScreen from "@/features/legal/components/LegalScreen";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return <LegalScreen show="terms" />;
}

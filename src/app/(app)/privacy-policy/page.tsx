import type { Metadata } from "next";
import LegalScreen from "@/features/legal/components/LegalScreen";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice",
  description: "What GodsWheel collects, how it is used, and your rights over your data.",
  path: ROUTES.privacy,
});

export default function PrivacyNoticePage() {
  return <LegalScreen show="privacy" />;
}

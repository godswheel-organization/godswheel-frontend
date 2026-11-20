import type { Metadata } from "next";
import LegalScreen from "@/features/legal/components/LegalScreen";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "The terms for using GodsWheel: your account, sermons and their rights, and acceptable use.",
  path: ROUTES.terms,
});

export default function TermsPage() {
  return <LegalScreen show="terms" />;
}

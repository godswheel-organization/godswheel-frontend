import type { Metadata } from "next";
import ChangePasswordScreen from "@/features/auth/components/change-password/ChangePasswordScreen";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Change password", noIndex: true });

export default function ChangePasswordPage() {
  return <ChangePasswordScreen />;
}

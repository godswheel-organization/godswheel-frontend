import type { Metadata } from "next";
import SettingsScreen from "@/features/settings/components/SettingsScreen";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Settings", noIndex: true });

export default function SettingsPage() {
  return <SettingsScreen />;
}

import type { Metadata } from "next";
import SavedSermonsScreen from "@/features/library/components/SavedSermonsScreen";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Saved sermons", noIndex: true });

export default function SavedSermonsPage() {
  return <SavedSermonsScreen />;
}

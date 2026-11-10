import type { Metadata } from "next";
import SavedSermonsScreen from "@/features/library/components/SavedSermonsScreen";

export const metadata: Metadata = { title: "Saved sermons" };

export default function SavedSermonsPage() {
  return <SavedSermonsScreen />;
}

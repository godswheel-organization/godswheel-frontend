import type { Metadata } from "next";
import LibraryOverview from "@/features/library/components/LibraryOverview";

export const metadata: Metadata = { title: "Your library" };

export default function LibraryPage() {
  return <LibraryOverview />;
}

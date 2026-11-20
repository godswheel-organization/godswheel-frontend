import type { Metadata } from "next";
import LibraryOverview from "@/features/library/components/LibraryOverview";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Your library", noIndex: true });

export default function LibraryPage() {
  return <LibraryOverview />;
}

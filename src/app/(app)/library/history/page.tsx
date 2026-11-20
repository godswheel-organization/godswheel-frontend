import type { Metadata } from "next";
import RecentlyPlayedScreen from "@/features/library/components/RecentlyPlayedScreen";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Recently played", noIndex: true });

export default function RecentlyPlayedPage() {
  return <RecentlyPlayedScreen />;
}

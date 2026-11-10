import type { Metadata } from "next";
import RecentlyPlayedScreen from "@/features/library/components/RecentlyPlayedScreen";

export const metadata: Metadata = { title: "Recently played" };

export default function RecentlyPlayedPage() {
  return <RecentlyPlayedScreen />;
}

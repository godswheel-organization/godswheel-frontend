import type { Metadata } from "next";
import AboutScreen from "@/features/about/components/AboutScreen";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About and standards",
  description: "How GodsWheel chooses sermons, credits preachers and ministries, and keeps listening respectful.",
  path: ROUTES.about,
});

export default function AboutPage() {
  return <AboutScreen />;
}

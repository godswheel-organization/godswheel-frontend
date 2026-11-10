import type { Metadata } from "next";
import AboutScreen from "@/features/about/components/AboutScreen";

export const metadata: Metadata = { title: "About and standards" };

export default function AboutPage() {
  return <AboutScreen />;
}

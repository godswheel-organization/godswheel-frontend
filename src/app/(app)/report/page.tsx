import type { Metadata } from "next";
import ReportIssueScreen from "@/features/reports/components/ReportIssueScreen";
import { getSermon } from "@/features/sermons/server/getSermon";

export const metadata: Metadata = { title: "Report an issue" };

// /report?sermon=<id> reports that sermon; plain /report is a general report or message.
export default async function ReportPage({ searchParams }: PageProps<"/report">) {
  const { sermon: sermonId } = await searchParams;
  const sermon = typeof sermonId === "string" ? await getSermon(sermonId) : null;
  return <ReportIssueScreen sermon={sermon} />;
}

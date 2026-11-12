import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SermonDetail from "@/features/sermons/components/detail/SermonDetail";
import { getSermon } from "@/features/sermons/server/getSermon";

export async function generateMetadata({ params }: PageProps<"/sermons/[id]">): Promise<Metadata> {
  const sermon = await getSermon((await params).id);
  return sermon ? { title: sermon.title, description: sermon.description } : {};
}

export default async function SermonPage({ params }: PageProps<"/sermons/[id]">) {
  const sermon = await getSermon((await params).id);
  if (!sermon) notFound();
  return <SermonDetail sermon={sermon} />;
}

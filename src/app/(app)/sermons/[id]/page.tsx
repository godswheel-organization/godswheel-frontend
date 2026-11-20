import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SermonDetail from "@/features/sermons/components/detail/SermonDetail";
import { sermonJsonLd, sermonSeoDescription, sermonSeoTitle } from "@/features/sermons/lib/sermonSeo";
import { TOPICS } from "@/features/sermons/lib/topics";
import { getSermon } from "@/features/sermons/server/getSermon";
import { ROUTES } from "@/lib/routes";
import JsonLd from "@/lib/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/sermons/[id]">): Promise<Metadata> {
  const sermon = await getSermon((await params).id);
  if (!sermon) return {};
  return pageMetadata({
    title: sermonSeoTitle(sermon),
    description: sermonSeoDescription(sermon),
    path: ROUTES.sermon(sermon.id),
    // Drawn per sermon by ./opengraph-image.tsx.
    ownImage: true,
    openGraph: {
      type: "article",
      publishedTime: sermon.publishedAt,
      section: TOPICS[sermon.topic].label,
      tags: [sermon.scripture, ...(sermon.relatedTopics ?? []).map((topic) => TOPICS[topic].label)],
    },
  });
}

export default async function SermonPage({ params }: PageProps<"/sermons/[id]">) {
  const sermon = await getSermon((await params).id);
  if (!sermon) notFound();
  return (
    <>
      <JsonLd data={sermonJsonLd(sermon)} />
      <SermonDetail sermon={sermon} />
    </>
  );
}

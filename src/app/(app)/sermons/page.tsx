import { Suspense } from "react";
import type { Metadata } from "next";
import BrowseSermons from "@/features/sermons/components/BrowseSermons";
import SermonListSkeleton from "@/features/sermons/components/SermonListSkeleton";
import { parseSermonFilters } from "@/features/sermons/lib/sermonFilters";
import { TOPICS } from "@/features/sermons/lib/topics";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import Container from "@/shared/ui/container/Container";

// Each category is a page of its own in search ("Faith sermons"); any other filter combination points
// search engines back at the main list and stays out of the index.
export async function generateMetadata({ searchParams }: PageProps<"/sermons">): Promise<Metadata> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const { topic, q, speaker, book } = parseSermonFilters(params);
  const narrowed = Boolean(q || speaker || book);

  if (topic && !narrowed) {
    const label = TOPICS[topic].label;
    return pageMetadata({
      title: `${label} sermons`,
      description: `Listen to sermons on ${label.toLowerCase()} by speaker or scripture, free on GodsWheel.`,
      path: ROUTES.sermonsByTopic(topic),
    });
  }
  return {
    ...pageMetadata({
      title: "Browse sermons",
      description: "Browse sermons by category, speaker or book of the Bible, and listen free.",
      path: ROUTES.sermons,
    }),
    ...(narrowed && { robots: { index: false, follow: true } }),
  };
}

export default function SermonsPage() {
  return (
    // BrowseSermons reads the URL's search params, which Next requires to sit under a Suspense boundary.
    <Suspense
      fallback={
        <Container className="py-6 md:py-10">
          <SermonListSkeleton className="lg:grid-cols-2" count={4} label="Loading sermons" />
        </Container>
      }
    >
      <BrowseSermons title="Browse sermons" />
    </Suspense>
  );
}

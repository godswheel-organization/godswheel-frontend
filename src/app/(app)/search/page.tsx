import { Suspense } from "react";
import type { Metadata } from "next";
import SearchSermons from "@/features/sermons/components/SearchSermons";
import SermonListSkeleton from "@/features/sermons/components/SermonListSkeleton";
import Container from "@/shared/ui/container/Container";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    // SearchSermons reads the URL's search params, which Next requires to sit under a Suspense boundary.
    <Suspense
      fallback={
        <Container className="py-6 md:py-10">
          <SermonListSkeleton className="lg:grid-cols-2" count={4} label="Loading search" />
        </Container>
      }
    >
      <SearchSermons />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import SearchSermons from "@/features/sermons/components/SearchSermons";
import Loader from "@/shared/ui/loaders/Loader";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    // SearchSermons reads the URL's search params, which Next requires to sit under a Suspense boundary.
    <Suspense fallback={<Loader className="py-24" label="Loading search" />}>
      <SearchSermons />
    </Suspense>
  );
}

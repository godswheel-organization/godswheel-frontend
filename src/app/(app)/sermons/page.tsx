import { Suspense } from "react";
import type { Metadata } from "next";
import BrowseSermons from "@/features/sermons/components/BrowseSermons";
import Loader from "@/shared/ui/loaders/Loader";

export const metadata: Metadata = { title: "Browse sermons" };

export default function SermonsPage() {
  return (
    // BrowseSermons reads the URL's search params, which Next requires to sit under a Suspense boundary.
    <Suspense fallback={<Loader className="py-24" label="Loading sermons" />}>
      <BrowseSermons title="Browse sermons" />
    </Suspense>
  );
}

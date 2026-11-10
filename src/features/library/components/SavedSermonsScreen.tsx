"use client";

import { useMemo, useState } from "react";
import SignInGate from "@/features/auth/components/account-prompt/SignInGate";
import { useSession } from "@/features/auth/hooks/useSession";
import SermonListItem from "@/features/sermons/components/SermonListItem";
import SermonListSkeleton from "@/features/sermons/components/SermonListSkeleton";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Container from "@/shared/ui/container/Container";
import InlineSelect from "@/shared/ui/form/InlineSelect";
import { Skeleton } from "@/shared/ui/skeleton/Skeleton";
import { useGetSavedSermonsQuery } from "../api/libraryApi";

type SavedSort = "newest" | "oldest" | "title";

const SORTS: { value: SavedSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "A–Z" },
];

export default function SavedSermonsScreen() {
  const { isSignedIn, isLoading: sessionLoading } = useSession();
  const { data: saved } = useGetSavedSermonsQuery(undefined, { skip: !isSignedIn });
  const [sort, setSort] = useState<SavedSort>("newest");

  const sorted = useMemo(() => {
    if (!saved) return undefined;
    const items = [...saved];
    if (sort === "oldest") items.sort((a, b) => a.savedAt.localeCompare(b.savedAt));
    else if (sort === "title") items.sort((a, b) => a.sermon.title.localeCompare(b.sermon.title));
    else items.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return items;
  }, [saved, sort]);

  return (
    <Container className="py-4 md:py-8">
      <PageHeader title="Saved sermons" backHref={ROUTES.library} />

      {sessionLoading ? (
        <SavedSkeleton />
      ) : !isSignedIn ? (
        <div className="mt-8">
          <SignInGate kind="library" />
        </div>
      ) : !sorted ? (
        <SavedSkeleton />
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-muted">
              {sorted.length} {sorted.length === 1 ? "sermon" : "sermons"}
            </p>
            <InlineSelect id="saved-sort" label="Sort" hideLabel value={sort} options={SORTS} onChange={setSort} />
          </div>
          {sorted.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-muted">
              Nothing saved yet. Tap the bookmark on any sermon to keep it here.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {sorted.map(({ sermon }) => (
                <li key={sermon.id}>
                  <SermonListItem sermon={sermon} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}

// The count/sort line and a few rows, in their final places.
function SavedSkeleton() {
  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <SermonListSkeleton count={4} className="mt-4 lg:grid-cols-2" label="Loading saved sermons" />
    </>
  );
}

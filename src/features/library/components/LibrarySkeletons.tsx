import { SermonListItemSkeleton } from "@/features/sermons/components/SermonListSkeleton";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";

// A Recently played row while it loads: the sermon row, then its progress line.
export function HistoryRowSkeleton() {
  return (
    <div>
      <SermonListItemSkeleton />
      <div className="mt-2 flex items-center gap-3 px-1">
        <Skeleton className="h-1 flex-1 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function HistoryListSkeleton({ count = 2, className }: { count?: number; className?: string }) {
  return (
    <SkeletonGroup label="Loading listening history" className={className ?? "grid grid-cols-1 gap-5 lg:grid-cols-2"}>
      {Array.from({ length: count }, (_, index) => (
        <HistoryRowSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
}

// The whole Library overview while the session check runs: three headed sections.
export function LibraryOverviewSkeleton() {
  return (
    <SkeletonGroup label="Loading your library" className="mt-8 flex flex-col gap-10">
      {[1, 2, 2].map((rows, section) => (
        <div key={section} className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Array.from({ length: rows }, (_, index) => (
              <SermonListItemSkeleton key={index} />
            ))}
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

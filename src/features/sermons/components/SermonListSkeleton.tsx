import { cn } from "@/lib/utils/cn";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";

// The shape of one SermonListItem while it loads: cover, three lines, the bookmark.
export function SermonListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-3 sm:p-4">
      <Skeleton className="size-16 shrink-0 rounded-xl sm:size-20" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="size-6 shrink-0 rounded-md" />
    </div>
  );
}

interface SermonListSkeletonProps {
  count?: number;
  label?: string;
  // Lay out like the real list it stands in for (e.g. two columns from lg up).
  className?: string;
}

export default function SermonListSkeleton({ count = 3, label = "Loading sermons", className }: SermonListSkeletonProps) {
  return (
    <SkeletonGroup label={label} className={cn("grid grid-cols-1 gap-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <SermonListItemSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
}

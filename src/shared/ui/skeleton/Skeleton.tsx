import { cn } from "@/lib/utils/cn";

// One grey placeholder block. Size and shape it with className (e.g. "h-3 w-2/3").
// Decorative: wrap a group of them in <SkeletonGroup> so screen readers hear one "Loading…".
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-md bg-surface-raised motion-safe:animate-pulse", className)} />;
}

interface SkeletonGroupProps {
  // What's loading, read out once (e.g. "Loading sermons").
  label: string;
  className?: string;
  children: React.ReactNode;
}

export function SkeletonGroup({ label, className, children }: SkeletonGroupProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}

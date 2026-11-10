import { formatSermonMeta } from "../lib/formatSermon";
import type { Sermon } from "../types";
import SermonArtwork from "./SermonArtwork";

// A sermon shown for reference (e.g. at the top of "Report an issue"): no link, no bookmark.
export default function SermonSummary({ sermon }: { sermon: Sermon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-3 sm:p-4">
      <SermonArtwork topic={sermon.topic} className="size-16 shrink-0 sm:size-20" iconClassName="size-6" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{sermon.title}</p>
        <p className="truncate text-sm text-muted">{sermon.preacher}</p>
        <p className="truncate text-sm text-gray-400">{formatSermonMeta(sermon)}</p>
      </div>
    </div>
  );
}

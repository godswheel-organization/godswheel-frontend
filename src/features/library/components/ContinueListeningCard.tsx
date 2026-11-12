"use client";

import { Play } from "lucide-react";
import { durationOf, playSermonAt } from "@/features/player/store/playerSlice";
import SermonArtwork from "@/features/sermons/components/SermonArtwork";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import { useAppDispatch } from "@/lib/store";
import ProgressBar from "@/shared/ui/progressbar/ProgressBar";
import { progressOf } from "../lib/history";
import type { HistoryEntry } from "../types";

// The sermon you were last in the middle of, one tap from carrying on where you stopped.
export default function ContinueListeningCard({ entry }: { entry: HistoryEntry }) {
  const dispatch = useAppDispatch();
  const { sermon, positionSeconds } = entry;

  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-3 sm:p-4">
      <div className="flex items-center gap-4">
        <SermonArtwork topic={sermon.topic} className="size-16 shrink-0 sm:size-20" iconClassName="size-6" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{sermon.title}</h3>
          <p className="truncate text-sm text-muted">{sermon.preacher}</p>
          <p className="text-sm text-gray-400">
            {formatPlaybackTime(positionSeconds)} of {formatPlaybackTime(durationOf(sermon))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(playSermonAt({ sermon, positionSeconds }))}
          aria-label={`Continue ${sermon.title} from ${formatPlaybackTime(positionSeconds)}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised"
        >
          <Play className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <ProgressBar value={progressOf(entry)} label={`${sermon.title} progress`} className="mt-3" />
    </article>
  );
}

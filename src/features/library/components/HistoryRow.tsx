"use client";

import toast from "react-hot-toast";
import { X } from "lucide-react";
import SermonListItem from "@/features/sermons/components/SermonListItem";
import ProgressBar from "@/shared/ui/progressbar/ProgressBar";
import { useRemoveFromHistoryMutation } from "../api/libraryApi";
import { progressOf, timeLeftLabel } from "../lib/history";
import type { HistoryEntry } from "../types";

// A Recently played row: the sermon, × to forget it, and how far you got.
export default function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const [remove, { isLoading }] = useRemoveFromHistoryMutation();
  const { sermon } = entry;

  return (
    <div>
      <SermonListItem
        sermon={sermon}
        action={
          <button
            type="button"
            disabled={isLoading}
            onClick={() => remove(sermon.id).unwrap().catch(() => toast.error("Couldn't remove it. Try again."))}
            aria-label={`Remove ${sermon.title} from listening history`}
            className="flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised disabled:opacity-60"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        }
      />
      <div className="mt-2 flex items-center gap-3 px-1">
        <ProgressBar value={progressOf(entry)} label={`${sermon.title} progress`} className="flex-1" />
        <span className="shrink-0 text-xs text-muted">{timeLeftLabel(entry)}</span>
      </div>
    </div>
  );
}

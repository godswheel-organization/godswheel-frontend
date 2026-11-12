"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Sermon } from "@/features/sermons/types";
import { cn } from "@/lib/utils/cn";
import { useToggleSave } from "../hooks/useToggleSave";

interface SaveSermonButtonProps {
  sermon: Sermon;
  className?: string;
}

// The bookmark icon button. Guests get the "Create an account to save sermons" prompt.
export default function SaveSermonButton({ sermon, className }: SaveSermonButtonProps) {
  const { saved, toggle, busy } = useToggleSave(sermon);
  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${sermon.title} from your library` : `Save ${sermon.title} to your library`}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full transition hover:bg-surface-raised disabled:opacity-60",
        saved ? "text-brand-500" : "text-foreground",
        className
      )}
    >
      <Icon className={cn("size-6", saved && "fill-brand-500/20")} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

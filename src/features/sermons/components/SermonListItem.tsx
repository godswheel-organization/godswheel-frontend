"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import SaveSermonButton from "@/features/library/components/SaveSermonButton";
import { ROUTES } from "@/lib/routes";
import { useAppSelector } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { formatSermonMeta } from "../lib/formatSermon";
import type { Sermon } from "../types";
import SermonArtwork from "./SermonArtwork";

interface SermonListItemProps {
  sermon: Sermon;
  // The button on the right: the bookmark by default; Recently played puts "remove from history" there.
  action?: ReactNode;
  // Replaces the "scripture · length · language" line (e.g. "12:48 of 38:00").
  meta?: ReactNode;
}

// A sermon row: tap anywhere to open its detail page; the bookmark saves it. Lit while it's in the mini player.
// The title link's ::after stretches over the whole row, and the bookmark sits above it (z-10),
// so the row is one big target without nesting a button inside a link.
export default function SermonListItem({ sermon, action, meta }: SermonListItemProps) {
  const isCurrent = useAppSelector((state) => state.player.current?.id === sermon.id);

  return (
    <article
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border p-3 transition sm:p-4",
        isCurrent ? "border-brand-500/60 bg-surface/60" : "border-border hover:border-brand-500/40 hover:bg-surface/40"
      )}
    >
      <SermonArtwork topic={sermon.topic} className="size-16 shrink-0 sm:size-20" iconClassName="size-6" />

      <div className="min-w-0 flex-1">
        <h3 className={cn("text-base font-semibold", isCurrent ? "text-brand-500" : "text-foreground")}>
          <Link
            href={ROUTES.sermon(sermon.id)}
            className="block max-w-full truncate after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-500"
          >
            {sermon.title}
          </Link>
        </h3>
        <p className="truncate text-sm text-muted">
          {sermon.preacher}
          {isCurrent && <span className="sr-only"> (now playing)</span>}
        </p>
        <p className="truncate text-sm text-gray-400">{meta ?? formatSermonMeta(sermon)}</p>
      </div>

      <div className="relative z-10">{action ?? <SaveSermonButton sermon={sermon} />}</div>
    </article>
  );
}

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { formatSermonMeta } from "../lib/formatSermon";
import { TOPICS } from "../lib/topics";
import type { Sermon } from "../types";
import SermonArtwork from "./SermonArtwork";

interface SermonCardProps {
  sermon: Sermon;
}

// A row with a small cover on phones; a stacked card with a wide cover from `sm` up.
export default function SermonCard({ sermon }: SermonCardProps) {
  return (
    <Link
      href={ROUTES.sermon(sermon.id)}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface/40 p-3 transition hover:border-brand-500/50 hover:bg-surface sm:flex-col sm:items-stretch sm:p-4"
    >
      <SermonArtwork
        topic={sermon.topic}
        className="size-20 shrink-0 sm:aspect-16/10 sm:size-auto sm:w-full"
        iconClassName="sm:size-10"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          {TOPICS[sermon.topic].label}
        </p>
        <h3 className="truncate text-base font-semibold text-foreground group-hover:text-brand-300 sm:min-h-12 sm:whitespace-normal sm:line-clamp-2">
          {sermon.title}
        </h3>
        <p className="truncate text-sm text-muted">{sermon.preacher}</p>
        <p className="truncate text-sm text-gray-400">{formatSermonMeta(sermon)}</p>
      </div>
    </Link>
  );
}

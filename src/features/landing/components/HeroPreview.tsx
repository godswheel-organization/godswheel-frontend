import { BookOpen, Bookmark, Play, SkipBack, SkipForward } from "lucide-react";
import SermonArtwork from "@/features/sermons/components/SermonArtwork";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import { TOPICS } from "@/features/sermons/lib/topics";
import type { Sermon } from "@/features/sermons/types";

interface HeroPreviewProps {
  sermon: Sermon;
}

// How far through the sermon the illustrative progress bar sits.
const PREVIEW_PROGRESS = 0.4;

// A still of the player, to show what listening looks like. Not interactive: the controls are decoration.
export default function HeroPreview({ sermon }: HeroPreviewProps) {
  const totalSeconds = sermon.durationMinutes * 60;

  return (
    <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-brand-500/10 blur-3xl" />

      <div className="relative rounded-3xl border border-border bg-surface/80 p-5 shadow-theme-xl backdrop-blur sm:p-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-brand-500" />
            Now playing
          </span>
          <span>{TOPICS[sermon.topic].label}</span>
        </div>

        <SermonArtwork topic={sermon.topic} className="mt-4 aspect-video w-full rounded-2xl sm:aspect-4/3" iconClassName="size-16" />

        <figcaption className="mt-5">
          <p className="font-serif text-2xl text-foreground">{sermon.title}</p>
          <p className="mt-1 text-sm text-muted">{sermon.preacher}</p>
        </figcaption>

        <div aria-hidden className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${PREVIEW_PROGRESS * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{formatPlaybackTime(totalSeconds * PREVIEW_PROGRESS)}</span>
            <span>{formatPlaybackTime(totalSeconds)}</span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-8 text-muted">
            <SkipBack className="size-5" />
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-500 text-brand-950 shadow-theme-lg">
              <Play className="size-6 translate-x-0.5 fill-current" />
            </span>
            <SkipForward className="size-5" />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -left-4 top-24 hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-theme-lg sm:flex lg:-left-10"
      >
        <BookOpen className="size-4 text-brand-500" />
        {sermon.scripture}
      </div>
      <div
        aria-hidden
        className="absolute -right-4 top-[42%] hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-theme-lg sm:flex lg:-right-8"
      >
        <Bookmark className="size-4 fill-current text-brand-500" />
        Saved to library
      </div>
    </figure>
  );
}

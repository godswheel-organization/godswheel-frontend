"use client";

import { Pause, Play } from "lucide-react";
import SermonArtwork from "@/features/sermons/components/SermonArtwork";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { durationOf, setExpanded, togglePlayback } from "../store/playerSlice";

// The now-playing bar, pinned above the bottom tabs on phones and along the bottom from md up.
// Tap it to open the full player. Renders nothing until a sermon is picked.
export default function MiniPlayer() {
  const { current, isPlaying, positionSeconds } = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();

  if (!current) return null;

  const Icon = isPlaying ? Pause : Play;
  const progress = positionSeconds / durationOf(current);

  return (
    <>
      {/* Takes the bar's height in the page flow, so the bar never covers the last row of content. */}
      <div aria-hidden className="h-[4.5rem]" />

      <section
        aria-label="Now playing"
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 md:bottom-0 md:left-64 md:transition-[left] md:duration-200 md:group-data-[sidebar=collapsed]/shell:left-20"
      >
        <div className="h-1 bg-surface-raised">
          <div className="h-full bg-brand-500" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="relative flex h-[4.25rem] items-center gap-3 border-t border-border/60 bg-surface px-4 sm:px-6">
          <SermonArtwork topic={current.topic} className="size-11 shrink-0 rounded-lg" iconClassName="size-5" />
          <div className="min-w-0 flex-1">
            {/* ::after stretches this over the bar, so tapping anywhere but Play opens the full player. */}
            <button
              type="button"
              onClick={() => dispatch(setExpanded(true))}
              className="block max-w-full truncate text-left font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand-500"
            >
              <span className="sr-only">Open player: </span>
              {current.title}
            </button>
            <p className="truncate text-sm text-muted">{current.preacher}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(togglePlayback())}
            aria-label={isPlaying ? `Pause ${current.title}` : `Play ${current.title}`}
            className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised"
          >
            <Icon className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </section>
    </>
  );
}

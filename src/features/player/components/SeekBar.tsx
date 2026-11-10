"use client";

import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import { useAppDispatch } from "@/lib/store";
import { seekTo } from "../store/playerSlice";

interface SeekBarProps {
  positionSeconds: number;
  durationSeconds: number;
}

// A native range input (keyboard and screen-reader friendly), filled orange up to the playhead.
export default function SeekBar({ positionSeconds, durationSeconds }: SeekBarProps) {
  const dispatch = useAppDispatch();
  const percent = durationSeconds ? (positionSeconds / durationSeconds) * 100 : 0;
  const remaining = durationSeconds - positionSeconds;

  return (
    <div>
      <input
        type="range"
        min={0}
        max={durationSeconds}
        step={1}
        value={positionSeconds}
        onChange={(event) => dispatch(seekTo(Number(event.target.value)))}
        aria-label="Seek"
        aria-valuetext={`${formatPlaybackTime(positionSeconds)} of ${formatPlaybackTime(durationSeconds)}`}
        className="range-seek w-full"
        style={{
          background: `linear-gradient(to right, var(--color-brand-500) ${percent}%, var(--color-surface-raised) ${percent}%)`,
        }}
      />
      <div className="mt-3 flex justify-between text-sm text-muted">
        <span>{formatPlaybackTime(positionSeconds)}</span>
        <span>{remaining > 0 ? `${formatPlaybackTime(remaining)} time left` : "Finished"}</span>
      </div>
    </div>
  );
}

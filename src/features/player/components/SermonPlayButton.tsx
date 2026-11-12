"use client";

import { Pause, Play } from "lucide-react";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import Button from "@/shared/ui/button/Button";
import { playSermon, togglePlayback } from "../store/playerSlice";

interface SermonPlayButtonProps {
  sermon: Sermon;
  className?: string;
}

// The detail page's main button. Mirrors the mini player: Play, then Pause while this sermon plays,
// then Resume once paused.
export default function SermonPlayButton({ sermon, className }: SermonPlayButtonProps) {
  const dispatch = useAppDispatch();
  const isCurrent = useAppSelector((state) => state.player.current?.id === sermon.id);
  const isPlaying = useAppSelector((state) => state.player.isPlaying);

  const playingThis = isCurrent && isPlaying;
  const Icon = playingThis ? Pause : Play;
  const label = playingThis ? "Pause" : isCurrent ? "Resume" : "Play";

  return (
    <Button
      type="button"
      size="lg"
      className={className}
      startIcon={<Icon className="size-5 fill-current" aria-hidden />}
      onClick={() => dispatch(isCurrent ? togglePlayback() : playSermon(sermon))}
    >
      {label}
    </Button>
  );
}

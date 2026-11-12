"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useRecordProgressMutation } from "@/features/library/api/libraryApi";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { durationOf, pause, progressTo, tick } from "../store/playerSlice";

// How often a signed-in listener's position is saved while playing (also saved on pause, finish and switch).
const SAVE_EVERY_MS = 15_000;
// Ignore audio/Redux drift smaller than this, so normal playback never triggers a seek.
const SEEK_TOLERANCE_SECONDS = 1.5;

// Makes the player actually advance. Sermons with audio play through an <audio> element; sermons without
// (all of them, until the API serves audio) run a one-second clock, so the seek bar, time left and listening
// history all behave as they will with real audio. Renders nothing visible. Mounted once, in the app layout.
export default function PlaybackEngine() {
  const dispatch = useAppDispatch();
  const { current, isPlaying, positionSeconds } = useAppSelector((state) => state.player);
  const { isSignedIn } = useSession();
  const [recordProgress] = useRecordProgressMutation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentId = current?.id;
  const hasAudio = Boolean(current?.audioUrl);

  // The simulated clock.
  useEffect(() => {
    if (!currentId || hasAudio || !isPlaying) return;
    const interval = setInterval(() => dispatch(tick(1)), 1000);
    return () => clearInterval(interval);
  }, [currentId, hasAudio, isPlaying, dispatch]);

  // Real audio: follow play/pause, and seeks made from the seek bar or ±15s.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => dispatch(pause()));
    else audio.pause();
  }, [isPlaying, currentId, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - positionSeconds) > SEEK_TOLERANCE_SECONDS) audio.currentTime = positionSeconds;
  }, [positionSeconds]);

  // Listening history, for signed-in users only. Reads the latest position from a ref so the timer
  // doesn't restart every second.
  const latest = useRef({ currentId, positionSeconds });
  useEffect(() => {
    latest.current = { currentId, positionSeconds };
  });

  const saveProgress = useCallback(() => {
    const { currentId: sermonId, positionSeconds: position } = latest.current;
    if (!isSignedIn || !sermonId) return;
    recordProgress({ sermonId, positionSeconds: position }).unwrap().catch(() => undefined);
  }, [isSignedIn, recordProgress]);

  useEffect(() => {
    if (!currentId) return;
    // Runs when a sermon starts, and when playback pauses or finishes (isPlaying flips).
    saveProgress();
    if (!isPlaying) return;
    const interval = setInterval(saveProgress, SAVE_EVERY_MS);
    return () => clearInterval(interval);
  }, [currentId, isPlaying, saveProgress]);

  if (!current?.audioUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={current.audioUrl}
      preload="metadata"
      onTimeUpdate={(event) => dispatch(progressTo(event.currentTarget.currentTime))}
      onEnded={() => dispatch(progressTo(durationOf(current)))}
    />
  );
}

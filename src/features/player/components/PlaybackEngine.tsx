"use client";

import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLazyGetProgressQuery, useRecordProgressMutation } from "@/features/library/api/libraryApi";
import { useGetSermonAudioQuery, useGetSermonQuery } from "@/features/sermons/api/sermonsApi";
import { isApiId } from "@/features/sermons/lib/apiSermon";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { durationKnown, durationOf, finished, pause, progressTo, seekTo, sermonDetailsLoaded, tick } from "../store/playerSlice";

// How often a signed-in listener's position is saved while playing (also saved on pause, finish and switch).
const SAVE_EVERY_MS = 15_000;
// Ignore audio/Redux drift smaller than this, so normal playback never triggers a seek.
const SEEK_TOLERANCE_SECONDS = 1.5;
// A saved position is only resumed from if it's past the opening and short of the end.
const RESUME_AFTER_SECONDS = 15;
const RESUME_BEFORE_END_SECONDS = 30;

// Makes the player actually advance. Renders nothing visible. Mounted once, in the app layout.
//
// Real sermons (the API's) play through an <audio> element. Their audio address comes from GET /sermons/{id}/audio
// (short-lived, so it's fetched again if it has expired), and a sermon started from a list also gets its full
// record (GET /sermons/{id}) merged in, for its passages. Started from the top by a signed-in listener, it picks
// up where they left it on any device (GET /sermons/{id}/progress). The mock catalogue's sermons have no audio
// and run a one-second clock instead, so the seek bar, time left and listening history still behave.
export default function PlaybackEngine() {
  const dispatch = useAppDispatch();
  const { current, isPlaying, positionSeconds } = useAppSelector((state) => state.player);
  const { isSignedIn } = useSession();
  const [recordProgress] = useRecordProgressMutation();
  const [fetchProgress] = useLazyGetProgressQuery();
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentId = current?.id;
  const isRealSermon = isApiId(currentId);

  // The latest state, for timers and requests that finish later. Updated first, so the effects below see it.
  const latest = useRef({ currentId, positionSeconds, sermon: current });
  useEffect(() => {
    latest.current = { currentId, positionSeconds, sermon: current };
  });

  // The full record, for a sermon started from a list (its summary has no passages or description).
  const { data: details } = useGetSermonQuery(currentId ?? "", { skip: !isRealSermon || current?.audioUrl !== undefined });
  useEffect(() => {
    if (details) dispatch(sermonDetailsLoaded(details));
  }, [details, dispatch]);

  // The audio address. A failure (no audio, storage down) leaves nothing to play.
  const audio = useGetSermonAudioQuery(currentId ?? "", { skip: !isRealSermon });
  const src = isRealSermon ? audio.data?.url : undefined;
  useEffect(() => {
    if (audio.isError) {
      dispatch(pause());
      toast.error("This sermon's audio isn't available right now.");
    }
  }, [audio.isError, dispatch]);

  // An address that stops working (it expired, most likely) is fetched again, once per address.
  const retriedSrc = useRef<string | undefined>(undefined);
  const refetchAudio = audio.refetch;
  const handleAudioError = () => {
    if (!src || retriedSrc.current === src) {
      dispatch(pause());
      return;
    }
    retriedSrc.current = src;
    void refetchAudio();
  };

  // Picking up where the listener left off, when a real sermon starts from the top. Until that's settled, no
  // progress is saved for it, so a save at 0:00 can't wipe the position being looked up.
  const resume = useRef<{ id: string; settled: boolean } | null>(null);
  useEffect(() => {
    if (!currentId) return;
    const check = { id: currentId, settled: false };
    resume.current = check;
    // Started partway (Continue listening, Recently played): that position was chosen.
    if (!isSignedIn || !isApiId(currentId) || latest.current.positionSeconds > 0) {
      check.settled = true;
      return;
    }
    fetchProgress(currentId)
      .unwrap()
      .then((saved) => {
        if (resume.current !== check || !saved) return;
        const length = latest.current.sermon ? durationOf(latest.current.sermon) : 0;
        const position = saved.positionSeconds;
        const worthResuming =
          position >= RESUME_AFTER_SECONDS && (!length || position < length - RESUME_BEFORE_END_SECONDS);
        // Only if the listener hasn't moved on in the meantime.
        if (worthResuming && latest.current.positionSeconds < RESUME_AFTER_SECONDS) {
          dispatch(seekTo(position));
          toast(`Picking up at ${formatPlaybackTime(position)}`, { id: "resume" });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        check.settled = true;
      });
  }, [currentId, isSignedIn, fetchProgress, dispatch]);

  // The simulated clock, for the mock catalogue's sermons.
  const simulated = Boolean(currentId) && !isRealSermon && !current?.audioUrl;
  useEffect(() => {
    if (!simulated || !isPlaying) return;
    const interval = setInterval(() => dispatch(tick(1)), 1000);
    return () => clearInterval(interval);
  }, [currentId, simulated, isPlaying, dispatch]);

  // Real audio: follow play/pause, and seeks made from the seek bar or ±15s.
  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    if (isPlaying) element.play().catch(() => dispatch(pause()));
    else element.pause();
    // src: the <audio> only appears once the address is in, after Play was pressed.
  }, [isPlaying, currentId, src, dispatch]);

  useEffect(() => {
    const element = audioRef.current;
    if (element && Math.abs(element.currentTime - positionSeconds) > SEEK_TOLERANCE_SECONDS) element.currentTime = positionSeconds;
  }, [positionSeconds]);

  // Saved on start, pause, finish and every 15 seconds of playback.
  const saveProgress = useCallback(() => {
    const { currentId: sermonId, positionSeconds: position } = latest.current;
    if (!isSignedIn || !sermonId) return;
    if (resume.current?.id === sermonId && !resume.current.settled) return;
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

  if (!current || !src) return null;

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="metadata"
      onLoadedMetadata={(event) => {
        const element = event.currentTarget;
        dispatch(durationKnown({ id: current.id, seconds: element.duration }));
        // Starting partway (Continue listening, a resumed position, a refreshed address): go to the position.
        if (Math.abs(element.currentTime - positionSeconds) > SEEK_TOLERANCE_SECONDS) element.currentTime = positionSeconds;
      }}
      onTimeUpdate={(event) => dispatch(progressTo(event.currentTarget.currentTime))}
      onEnded={() => dispatch(finished())}
      onError={handleAudioError}
    />
  );
}

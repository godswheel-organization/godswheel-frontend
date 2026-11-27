import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Sermon } from "@/features/sermons/types";

// What's loaded in the player and where it's at. Client-only UI state, so a slice rather than RTK Query;
// listening history is reported to the server separately (see PlaybackEngine).
interface PlayerState {
  current: Sermon | null;
  isPlaying: boolean;
  positionSeconds: number;
  // The full-screen "Now playing" view, vs. the mini player bar.
  expanded: boolean;
}

const initialState: PlayerState = { current: null, isPlaying: false, positionSeconds: 0, expanded: false };

// The sermon's length in seconds; 0 while unknown (the audio's own length fills it in, see durationKnown).
export const durationOf = (sermon: Sermon) => sermon.durationSeconds ?? 0;
// An unknown length doesn't cap the position.
const clamp = (seconds: number, sermon: Sermon) => Math.min(Math.max(0, seconds), durationOf(sermon) || Infinity);
const isAtEnd = (seconds: number, sermon: Sermon) => durationOf(sermon) > 0 && seconds >= durationOf(sermon);
// Starting the loaded sermon again from a list (a summary) keeps the full record already fetched for it.
const withLoadedDetails = (current: Sermon | null, next: Sermon): Sermon =>
  current?.id === next.id ? { ...current, ...next } : next;

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Starts a sermon from the top, or carries on if it's the one already loaded.
    playSermon(state, action: PayloadAction<Sermon>) {
      if (state.current?.id !== action.payload.id) state.positionSeconds = 0;
      // A finished sermon starts over rather than "playing" at its last second.
      else if (isAtEnd(state.positionSeconds, action.payload)) state.positionSeconds = 0;
      state.current = withLoadedDetails(state.current, action.payload);
      state.isPlaying = true;
    },
    // Resume from a saved position (Continue listening, Recently played).
    playSermonAt(state, action: PayloadAction<{ sermon: Sermon; positionSeconds: number }>) {
      const { sermon, positionSeconds } = action.payload;
      state.current = withLoadedDetails(state.current, sermon);
      state.positionSeconds = isAtEnd(positionSeconds, sermon) ? 0 : clamp(positionSeconds, sermon);
      state.isPlaying = true;
    },
    togglePlayback(state) {
      if (!state.current) return;
      if (!state.isPlaying && isAtEnd(state.positionSeconds, state.current)) state.positionSeconds = 0;
      state.isPlaying = !state.isPlaying;
    },
    pause(state) {
      state.isPlaying = false;
    },
    seekTo(state, action: PayloadAction<number>) {
      if (state.current) state.positionSeconds = clamp(action.payload, state.current);
    },
    skipBy(state, action: PayloadAction<number>) {
      if (state.current) state.positionSeconds = clamp(state.positionSeconds + action.payload, state.current);
    },
    // The playback clock (or the audio element) reporting where it is. Stops at the end.
    progressTo(state, action: PayloadAction<number>) {
      if (!state.current) return;
      state.positionSeconds = clamp(action.payload, state.current);
      if (isAtEnd(state.positionSeconds, state.current)) state.isPlaying = false;
    },
    // The audio has ended (its real end, whatever length the sermon claimed).
    finished(state) {
      if (!state.current) return;
      state.positionSeconds = durationOf(state.current) || state.positionSeconds;
      state.isPlaying = false;
    },
    // The simulated clock's heartbeat (sermons without audio): move on by a number of seconds.
    tick(state, action: PayloadAction<number>) {
      if (!state.current) return;
      state.positionSeconds = clamp(state.positionSeconds + action.payload, state.current);
      if (isAtEnd(state.positionSeconds, state.current)) state.isPlaying = false;
    },
    // A sermon started from a list is a summary: its full record (audio, passages, description) arrives after,
    // and is merged in if that sermon is still the one loaded.
    sermonDetailsLoaded(state, action: PayloadAction<Sermon>) {
      if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload };
    },
    // The audio's own length, for a sermon whose record didn't give one.
    durationKnown(state, action: PayloadAction<{ id: string; seconds: number }>) {
      const { id, seconds } = action.payload;
      if (state.current?.id === id && !state.current.durationSeconds && Number.isFinite(seconds) && seconds > 0) {
        state.current.durationSeconds = Math.round(seconds);
      }
    },
    setExpanded(state, action: PayloadAction<boolean>) {
      state.expanded = action.payload && state.current !== null;
    },
    closePlayer() {
      return initialState;
    },
  },
});

export const {
  playSermon,
  playSermonAt,
  togglePlayback,
  pause,
  seekTo,
  skipBy,
  progressTo,
  finished,
  tick,
  sermonDetailsLoaded,
  durationKnown,
  setExpanded,
  closePlayer,
} = playerSlice.actions;
export default playerSlice.reducer;

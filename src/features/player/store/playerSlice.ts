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

export const durationOf = (sermon: Sermon) => sermon.durationMinutes * 60;
const clamp = (seconds: number, sermon: Sermon) => Math.min(Math.max(0, seconds), durationOf(sermon));

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Starts a sermon from the top, or carries on if it's the one already loaded.
    playSermon(state, action: PayloadAction<Sermon>) {
      if (state.current?.id !== action.payload.id) state.positionSeconds = 0;
      // A finished sermon starts over rather than "playing" at its last second.
      else if (state.positionSeconds >= durationOf(action.payload)) state.positionSeconds = 0;
      state.current = action.payload;
      state.isPlaying = true;
    },
    // Resume from a saved position (Continue listening, Recently played).
    playSermonAt(state, action: PayloadAction<{ sermon: Sermon; positionSeconds: number }>) {
      const { sermon, positionSeconds } = action.payload;
      state.current = sermon;
      state.positionSeconds = positionSeconds >= durationOf(sermon) ? 0 : clamp(positionSeconds, sermon);
      state.isPlaying = true;
    },
    togglePlayback(state) {
      if (!state.current) return;
      if (!state.isPlaying && state.positionSeconds >= durationOf(state.current)) state.positionSeconds = 0;
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
      if (state.positionSeconds >= durationOf(state.current)) state.isPlaying = false;
    },
    // The simulated clock's heartbeat (sermons without audio): move on by a number of seconds.
    tick(state, action: PayloadAction<number>) {
      if (!state.current) return;
      state.positionSeconds = clamp(state.positionSeconds + action.payload, state.current);
      if (state.positionSeconds >= durationOf(state.current)) state.isPlaying = false;
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
  tick,
  setExpanded,
  closePlayer,
} = playerSlice.actions;
export default playerSlice.reducer;

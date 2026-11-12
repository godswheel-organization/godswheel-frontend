import { describe, expect, it } from "vitest";
import { sermons } from "@/features/sermons/mocks/sermons";
import reducer, {
  closePlayer,
  pause,
  playSermon,
  playSermonAt,
  progressTo,
  seekTo,
  setExpanded,
  skipBy,
  tick,
  togglePlayback,
} from "./playerSlice";

// "Arise and Shine" is 38 minutes (2280s); "Living by Faith" is 42.
const [arise, living] = sermons;
const END = 38 * 60;

describe("playerSlice", () => {
  it("starts empty and ignores controls with nothing loaded", () => {
    let state = reducer(undefined, togglePlayback());
    state = reducer(state, skipBy(15));
    state = reducer(state, setExpanded(true));
    expect(state).toEqual({ current: null, isPlaying: false, positionSeconds: 0, expanded: false });
  });

  it("starts a new sermon from the top but carries on with the current one", () => {
    let state = reducer(undefined, playSermon(arise));
    state = reducer(state, progressTo(120));
    state = reducer(state, pause());

    state = reducer(state, playSermon(arise));
    expect(state).toMatchObject({ isPlaying: true, positionSeconds: 120 });

    state = reducer(state, playSermon(living));
    expect(state).toMatchObject({ current: living, isPlaying: true, positionSeconds: 0 });
  });

  it("resumes from a saved position, but restarts a finished sermon", () => {
    expect(reducer(undefined, playSermonAt({ sermon: arise, positionSeconds: 768 }))).toMatchObject({ positionSeconds: 768 });
    expect(reducer(undefined, playSermonAt({ sermon: arise, positionSeconds: END }))).toMatchObject({ positionSeconds: 0 });
  });

  it("keeps seeking and skipping inside the sermon", () => {
    let state = reducer(undefined, playSermon(arise));
    state = reducer(state, skipBy(-15));
    expect(state.positionSeconds).toBe(0);
    state = reducer(state, seekTo(END - 5));
    state = reducer(state, skipBy(15));
    expect(state.positionSeconds).toBe(END);
  });

  it("stops at the end, and Play then starts over", () => {
    let state = reducer(undefined, playSermon(arise));
    state = reducer(state, progressTo(END + 3));
    expect(state).toMatchObject({ positionSeconds: END, isPlaying: false });

    state = reducer(state, togglePlayback());
    expect(state).toMatchObject({ positionSeconds: 0, isPlaying: true });
  });

  it("ticks forward while simulating playback, and stops at the end", () => {
    let state = reducer(undefined, playSermon(arise));
    state = reducer(state, tick(1));
    state = reducer(state, tick(1));
    expect(state.positionSeconds).toBe(2);
    state = reducer(state, seekTo(END - 1));
    state = reducer(state, tick(5));
    expect(state).toMatchObject({ positionSeconds: END, isPlaying: false });
  });

  it("opens and closes the full player, and resets on close", () => {
    let state = reducer(undefined, playSermon(arise));
    state = reducer(state, setExpanded(true));
    expect(state.expanded).toBe(true);
    expect(reducer(state, closePlayer())).toEqual({ current: null, isPlaying: false, positionSeconds: 0, expanded: false });
  });
});

import { describe, expect, it } from "vitest";
import { testSermon } from "@/features/sermons/lib/testSermon";
import type { HistoryEntry } from "../types";
import { groupByDay, latestUnfinished, progressOf, timeLeftLabel } from "./history";

// A 38-minute sermon.
const sermon = testSermon({ id: "s", durationMinutes: 38 });
const entry = (overrides: Partial<HistoryEntry>): HistoryEntry => ({
  sermon,
  positionSeconds: 0,
  playedAt: "2026-11-10T09:00:00",
  finished: false,
  ...overrides,
});

describe("timeLeftLabel and progressOf", () => {
  it("rounds minutes left up, and reports finished", () => {
    expect(timeLeftLabel(entry({ positionSeconds: 12 * 60 + 48 }))).toBe("26 min left");
    expect(timeLeftLabel(entry({ positionSeconds: 38 * 60 - 10 }))).toBe("1 min left");
    expect(timeLeftLabel(entry({ positionSeconds: 38 * 60, finished: true }))).toBe("Finished");
  });

  it("measures progress, with finished as complete", () => {
    expect(progressOf(entry({ positionSeconds: 19 * 60 }))).toBe(0.5);
    expect(progressOf(entry({ positionSeconds: 60, finished: true }))).toBe(1);
  });
});

describe("groupByDay", () => {
  // Local times, so the test means the same thing in every time zone.
  const now = new Date(2026, 10, 10, 12, 0);

  it("labels today, yesterday, then the date, keeping order", () => {
    const groups = groupByDay(
      [
        entry({ sermon: testSermon({ id: "a" }), playedAt: new Date(2026, 10, 10, 8, 0).toISOString() }),
        entry({ sermon: testSermon({ id: "b" }), playedAt: new Date(2026, 10, 10, 0, 5).toISOString() }),
        entry({ sermon: testSermon({ id: "c" }), playedAt: new Date(2026, 10, 9, 23, 55).toISOString() }),
        entry({ sermon: testSermon({ id: "d" }), playedAt: new Date(2026, 10, 3, 18, 0).toISOString() }),
      ],
      now
    );
    expect(groups.map((group) => [group.label, group.entries.map((item) => item.sermon.id)])).toEqual([
      ["Today", ["a", "b"]],
      ["Yesterday", ["c"]],
      ["3 Nov 2026", ["d"]],
    ]);
  });
});

describe("latestUnfinished", () => {
  it("skips finished sermons", () => {
    const finished = entry({ sermon: testSermon({ id: "done" }), finished: true });
    const halfway = entry({ sermon: testSermon({ id: "half" }), positionSeconds: 600 });
    expect(latestUnfinished([finished, halfway])?.sermon.id).toBe("half");
    expect(latestUnfinished([finished])).toBeUndefined();
  });
});

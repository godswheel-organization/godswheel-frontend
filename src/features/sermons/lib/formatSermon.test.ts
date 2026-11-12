import { describe, expect, it } from "vitest";
import { formatPlaybackTime, formatSermonDate, formatSermonMeta } from "./formatSermon";
import { testSermon } from "./testSermon";

describe("formatSermonMeta", () => {
  const sermon = testSermon({ id: "1", scripture: "Isaiah 60:1", durationMinutes: 38, publishedAt: "2026-10-12" });

  it("joins scripture, length and language", () => {
    expect(formatSermonMeta(sermon)).toBe("Isaiah 60:1 · 38 min · English");
  });

  it("adds the date for the detail page", () => {
    expect(formatSermonMeta(sermon, { withDate: true })).toBe("Isaiah 60:1 · 38 min · English · 12 Oct 2026");
  });
});

describe("formatSermonDate", () => {
  it("prints day, short month and year, never shifted by time zone", () => {
    expect(formatSermonDate("2026-01-01")).toBe("1 Jan 2026");
    expect(formatSermonDate("2026-12-31T23:30:00-05:00")).toBe("31 Dec 2026");
  });
});

describe("formatPlaybackTime", () => {
  it("shows minutes and zero-padded seconds", () => {
    expect(formatPlaybackTime(0)).toBe("0:00");
    expect(formatPlaybackTime(912)).toBe("15:12");
  });

  it("adds hours past sixty minutes", () => {
    expect(formatPlaybackTime(3725)).toBe("1:02:05");
  });

  it("never goes negative", () => {
    expect(formatPlaybackTime(-5)).toBe("0:00");
  });
});

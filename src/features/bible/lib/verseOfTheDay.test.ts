import { describe, expect, it } from "vitest";
import { KJV_PASSAGES } from "../mocks/kjv";
import { DAILY_VERSES } from "./dailyVerses";
import { localDayNumber, msUntilNextDay, verseOfTheDay } from "./verseOfTheDay";

describe("verseOfTheDay", () => {
  const today = localDayNumber(new Date(2026, 10, 21, 9, 30));

  it("gives the same verse all day, for everyone", () => {
    expect(verseOfTheDay(today)).toEqual(verseOfTheDay(today));
    expect(localDayNumber(new Date(2026, 10, 21, 0, 0, 1))).toBe(today);
    expect(localDayNumber(new Date(2026, 10, 21, 23, 59, 59))).toBe(today);
  });

  it("turns over at the user's own midnight", () => {
    expect(localDayNumber(new Date(2026, 10, 22, 0, 0, 1))).toBe(today + 1);
  });

  it("shows every verse once before any comes back", () => {
    const start = Math.ceil(today / DAILY_VERSES.length) * DAILY_VERSES.length;
    const pass = Array.from({ length: DAILY_VERSES.length }, (_, offset) => verseOfTheDay(start + offset).reference);
    expect(new Set(pass).size).toBe(DAILY_VERSES.length);
  });

  it("isn't simply the list in order, and each pass is shuffled differently", () => {
    const n = DAILY_VERSES.length;
    const firstPass = Array.from({ length: n }, (_, offset) => verseOfTheDay(n * 10 + offset).reference);
    const nextPass = Array.from({ length: n }, (_, offset) => verseOfTheDay(n * 11 + offset).reference);
    expect(firstPass).not.toEqual(DAILY_VERSES.map((verse) => verse.reference));
    expect(firstPass).not.toEqual(nextPass);
  });

  it("knows how long until midnight", () => {
    expect(msUntilNextDay(new Date(2026, 10, 21, 23, 0, 0))).toBe(3_600_000);
  });
});

describe("DAILY_VERSES", () => {
  it("has no duplicates and keeps each verse short enough for the sidebar card", () => {
    expect(new Set(DAILY_VERSES.map((verse) => verse.reference)).size).toBe(DAILY_VERSES.length);
    for (const verse of DAILY_VERSES) expect(verse.text.length, verse.reference).toBeLessThanOrEqual(180);
  });

  it("matches the app's other KJV text wherever the two overlap", () => {
    for (const verse of DAILY_VERSES) {
      if (KJV_PASSAGES[verse.reference]) expect(verse.text, verse.reference).toBe(KJV_PASSAGES[verse.reference]);
    }
  });
});

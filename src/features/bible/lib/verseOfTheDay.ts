import { DAILY_VERSES, type DailyVerse } from "./dailyVerses";

const DAY_MS = 86_400_000;

// Days since 1 January 1970 in the user's own calendar, so the verse turns over at their midnight, not UTC's.
export function localDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

// A small seeded random generator (mulberry32): the same seed always gives the same sequence.
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

// The order verses appear in during one pass through the list: shuffled, but the same for everyone.
function shuffledOrder(cycle: number, length: number): number[] {
  const random = seededRandom(cycle * 7919 + 17);
  const order = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

// The day's verse. It looks random, but every visitor gets the same one on the same date, a reload doesn't
// change it, and no verse comes back until the whole list has been shown (each pass is freshly shuffled).
export function verseOfTheDay(dayNumber: number, verses: readonly DailyVerse[] = DAILY_VERSES): DailyVerse {
  const cycle = Math.floor(dayNumber / verses.length);
  return verses[shuffledOrder(cycle, verses.length)[dayNumber - cycle * verses.length]];
}

// Milliseconds until the user's next midnight (when the verse changes).
export function msUntilNextDay(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

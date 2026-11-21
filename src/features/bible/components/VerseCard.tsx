"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import type { DailyVerse } from "../lib/dailyVerses";
import { localDayNumber, msUntilNextDay, verseOfTheDay } from "../lib/verseOfTheDay";

// The user's local day, re-read at midnight and whenever the tab comes back (a laptop may sleep past midnight).
// The server can't know the user's date or time zone, so it renders the placeholder (null) instead.
function subscribeToDay(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    // A second past midnight, so the new day has definitely begun.
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, msUntilNextDay(new Date()) + 1000);
  };
  schedule();
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function useLocalDay(): number | null {
  return useSyncExternalStore(
    subscribeToDay,
    () => localDayNumber(new Date()),
    () => null
  );
}

// The sidebar's verse of the day, written out letter by letter.
export default function VerseCard() {
  const day = useLocalDay();
  const verse = day === null ? null : verseOfTheDay(day);

  return (
    <figure className="rounded-2xl bg-linear-to-br from-brand-500 to-brand-400 p-5 text-on-brand shadow-[0_12px_32px_-12px_var(--color-brand-500)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">Verse of the day</p>
      {verse ? (
        // A new day remounts it, so the new verse writes itself out from the start.
        <WrittenVerse key={verse.reference} verse={verse} />
      ) : (
        <div aria-hidden className="mt-3 flex flex-col gap-2">
          <span className="h-3.5 w-full rounded-full bg-on-brand/10" />
          <span className="h-3.5 w-11/12 rounded-full bg-on-brand/10" />
          <span className="h-3.5 w-2/3 rounded-full bg-on-brand/10" />
        </div>
      )}
    </figure>
  );
}

const START_DELAY_MS = 450;
// About three seconds for a typical verse, whatever its length, within these bounds per letter.
const WRITE_TIME_MS = 3200;
const MIN_LETTER_MS = 18;
const MAX_LETTER_MS = 48;
// The loop: write it out, leave it up long enough to read, rub it out quickly, then write it again.
const HOLD_MS = 9000;
const ERASE_TIME_MS = 1100;
const MIN_ERASE_MS = 6;
const MAX_ERASE_MS = 22;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// A short breath after punctuation, as a hand writing it out would take.
function pauseAfter(character: string | undefined) {
  if (!character) return START_DELAY_MS;
  if (".?!".includes(character)) return 260;
  if (",;:".includes(character)) return 130;
  return 0;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Writes the verse out, holds it, erases it and writes it again, for as long as it's on screen.
function WrittenVerse({ verse }: { verse: DailyVerse }) {
  const { text, reference } = verse;
  // Reduced motion: the whole verse, still. It never loops.
  const [still] = useState(prefersReducedMotion);
  const [written, setWritten] = useState(still ? text.length : 0);
  const [erasing, setErasing] = useState(false);
  const done = written >= text.length;
  const letterMs = clamp(WRITE_TIME_MS / text.length, MIN_LETTER_MS, MAX_LETTER_MS);
  const eraseMs = clamp(ERASE_TIME_MS / text.length, MIN_ERASE_MS, MAX_ERASE_MS);

  useEffect(() => {
    if (still) return;
    let next: () => void;
    let delay: number;
    if (erasing) {
      // Rubbed out: start writing again after a beat. Otherwise take away one more letter.
      [next, delay] = written === 0 ? [() => setErasing(false), START_DELAY_MS] : [() => setWritten((count) => count - 1), eraseMs];
    } else {
      // Fully written: leave it up to be read. Otherwise add one more letter.
      [next, delay] = done
        ? [() => setErasing(true), HOLD_MS]
        : [() => setWritten((count) => count + 1), letterMs + pauseAfter(text[written - 1])];
    }
    const timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [done, eraseMs, erasing, letterMs, still, text, written]);

  return (
    <>
      <blockquote className="mt-3 font-serif text-base font-medium italic leading-snug">
        {/* Screen readers get the verse once, whole, rather than letter by letter. */}
        <span className="sr-only">{text}</span>
        {/* The full verse, unseen, holds the card at its final size so it doesn't grow line by line. */}
        <span aria-hidden className="grid">
          <span className="invisible col-start-1 row-start-1">&ldquo;{text}&rdquo;</span>
          <span className="col-start-1 row-start-1">
            &ldquo;{text.slice(0, written)}
            {done && <>&rdquo;</>}
            {/* The pen keeps blinking while the verse is up, as it waits to write it again. */}
            {!still && (
              <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.15em] rounded-full bg-current motion-safe:animate-caret-blink" />
            )}
          </span>
        </span>
      </blockquote>
      <figcaption
        className={cn("mt-3 text-sm font-medium transition-opacity duration-700", done && !erasing ? "opacity-80" : "opacity-0")}
      >
        {reference} (KJV)
      </figcaption>
    </>
  );
}

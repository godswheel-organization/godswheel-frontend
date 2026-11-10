import { durationOf } from "@/features/player/store/playerSlice";
import { formatSermonDate } from "@/features/sermons/lib/formatSermon";
import type { HistoryEntry } from "../types";

// How far through, 0–1 (finished counts as all the way).
export function progressOf(entry: HistoryEntry): number {
  return entry.finished ? 1 : Math.min(entry.positionSeconds / durationOf(entry.sermon), 1);
}

// "25 min left" (rounded up, so it never says "0 min left" before the end), or "Finished".
export function timeLeftLabel(entry: HistoryEntry): string {
  if (entry.finished) return "Finished";
  const minutesLeft = Math.ceil((durationOf(entry.sermon) - entry.positionSeconds) / 60);
  return minutesLeft <= 0 ? "Finished" : `${minutesLeft} min left`;
}

// Calendar day in the listener's own time zone, e.g. "2026-11-10".
const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Groups history (already newest first) under "Today", "Yesterday", then the date ("3 Nov 2026").
export function groupByDay(entries: HistoryEntry[], now = new Date()): { label: string; entries: HistoryEntry[] }[] {
  const today = localDay(now);
  const yesterday = localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const day = localDay(new Date(entry.playedAt));
    const label = day === today ? "Today" : day === yesterday ? "Yesterday" : formatSermonDate(day);
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return [...groups].map(([label, grouped]) => ({ label, entries: grouped }));
}

// Continue listening: the most recent sermon not yet finished.
export function latestUnfinished(entries: HistoryEntry[]): HistoryEntry | undefined {
  return entries.find((entry) => !entry.finished);
}

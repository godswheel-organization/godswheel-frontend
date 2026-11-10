import type { Sermon } from "../types";

// "Isaiah 60:1 · 38 min · English" — the one-line summary under a sermon's title.
// The detail page adds the date: "… · English · 12 Oct 2026".
export function formatSermonMeta(sermon: Sermon, { withDate = false } = {}): string {
  const parts = [sermon.scripture, `${sermon.durationMinutes} min`, sermon.language];
  if (withDate) parts.push(formatSermonDate(sermon.publishedAt));
  return parts.join(" · ");
}

// "2026-10-12" → "12 Oct 2026". Read and printed as UTC so a calendar date never shifts a day by time zone.
export function formatSermonDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  );
}

// Seconds → "m:ss" (or "h:mm:ss" past an hour), as a media player shows it.
export function formatPlaybackTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const pad = (value: number) => String(value).padStart(2, "0");
  const secs = pad(seconds % 60);

  return hours > 0 ? `${hours}:${pad(minutes)}:${secs}` : `${minutes}:${secs}`;
}

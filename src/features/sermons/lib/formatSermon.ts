import type { Sermon } from "../types";

// Whole minutes, at least 1; undefined when the length isn't known.
export function sermonMinutes(sermon: Pick<Sermon, "durationSeconds">): number | undefined {
  return sermon.durationSeconds ? Math.max(1, Math.round(sermon.durationSeconds / 60)) : undefined;
}

// "Isaiah 60:1 · 38 min · English": the one-line summary under a sermon's title. The detail page adds the date:
// "… · English · 12 Oct 2026". Whatever isn't known is left out (a sermon from a list has no passage or language).
export function formatSermonMeta(sermon: Sermon, { withDate = false } = {}): string {
  const minutes = sermonMinutes(sermon);
  const parts = [
    sermon.scripture,
    minutes && `${minutes} min`,
    sermon.language,
    withDate && sermon.publishedAt && formatSermonDate(sermon.publishedAt),
  ];
  return parts.filter(Boolean).join(" · ");
}

// "2026-10-12" (or a full ISO date-time) → "12 Oct 2026". Read and printed as UTC so a date never shifts a day
// by time zone.
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

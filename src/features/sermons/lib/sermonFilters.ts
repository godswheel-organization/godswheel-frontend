import type { SermonFilters, SermonSort } from "../types";
import { isApiId } from "./apiSermon";
import { isCategorySlug } from "./categories";

// Browse keeps its filters in the URL (?q=&category=&speaker=&book=&sort=), so a filtered view can be
// shared, bookmarked and restored with the back button. These two functions are the only translation.

export const SORT_OPTIONS: { value: SermonSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

// The API's own default. Retired sorts in old links (?sort=relevance, ?sort=shortest) fall back to it.
const DEFAULT_SORT: SermonSort = "newest";

// The six topics links used before categories came from the API (old welcome emails, bookmarks, shared links),
// each sent to its closest API category, so ?topic=faith still opens Faith & Trust.
const LEGACY_TOPICS: Record<string, string> = {
  purpose: "spiritual-growth",
  calling: "evangelism-discipleship",
  faith: "faith-trust",
  prayer: "prayer-worship",
  family: "love-relationships",
  worship: "prayer-worship",
};

const isSort = (value: string | null): value is SermonSort =>
  value !== null && SORT_OPTIONS.some((option) => option.value === value);

const nonEmpty = (value: string | null) => value?.trim() || undefined;

// Unknown or malformed values are dropped rather than trusted.
export function parseSermonFilters(params: URLSearchParams): SermonFilters {
  const legacyTopic = params.get("topic");
  const category = params.get("category") ?? (legacyTopic ? LEGACY_TOPICS[legacyTopic] : null);
  const sort = params.get("sort");
  const speaker = params.get("speaker");
  return {
    q: nonEmpty(params.get("q")),
    category: isCategorySlug(category) ? category : undefined,
    // A speaker id; old links named the speaker instead, which the API can't filter by.
    speaker: isApiId(speaker) ? speaker : undefined,
    book: nonEmpty(params.get("book")),
    sort: isSort(sort) ? sort : DEFAULT_SORT,
  };
}

// Leaves out empty values and the default sort, so an unfiltered view is just /sermons.
export function toSermonSearchParams(filters: SermonFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.speaker) params.set("speaker", filters.speaker);
  if (filters.book) params.set("book", filters.book);
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  return params;
}

export function hasActiveFilters(filters: SermonFilters): boolean {
  return Boolean(filters.category || filters.speaker || filters.book);
}

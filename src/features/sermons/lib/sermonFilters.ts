import type { SermonFilters, SermonSort, SermonTopic } from "../types";
import { TOPIC_ORDER } from "./topics";

// Browse keeps its filters in the URL (?q=&topic=&speaker=&book=&sort=), so a filtered view can be
// shared, bookmarked and restored with the back button. These two functions are the only translation.

export const SORT_OPTIONS: { value: SermonSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "shortest", label: "Shortest" },
];

const DEFAULT_SORT: SermonSort = "relevance";

const isTopic = (value: string | null): value is SermonTopic =>
  value !== null && (TOPIC_ORDER as string[]).includes(value);

const isSort = (value: string | null): value is SermonSort =>
  value !== null && SORT_OPTIONS.some((option) => option.value === value);

const nonEmpty = (value: string | null) => value?.trim() || undefined;

// Unknown or malformed values are dropped rather than trusted.
export function parseSermonFilters(params: URLSearchParams): SermonFilters {
  const topic = params.get("topic");
  const sort = params.get("sort");
  return {
    q: nonEmpty(params.get("q")),
    topic: isTopic(topic) ? topic : undefined,
    speaker: nonEmpty(params.get("speaker")),
    book: nonEmpty(params.get("book")),
    sort: isSort(sort) ? sort : DEFAULT_SORT,
  };
}

// Leaves out empty values and the default sort, so an unfiltered view is just /sermons.
export function toSermonSearchParams(filters: SermonFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.speaker) params.set("speaker", filters.speaker);
  if (filters.book) params.set("book", filters.book);
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  return params;
}

export function hasActiveFilters(filters: SermonFilters): boolean {
  return Boolean(filters.topic || filters.speaker || filters.book);
}

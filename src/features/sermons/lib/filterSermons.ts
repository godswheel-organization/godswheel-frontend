import type { Sermon, SermonFilterOptions, SermonFilters } from "../types";
import { scriptureBook } from "./scripture";
import { MATCH_FIELD_ORDER, matchSermon } from "./searchSermons";

// Applies every filter, then the chosen sort. Stands in for the server until the sermons API exists.
export function filterSermons(sermons: Sermon[], filters: SermonFilters): Sermon[] {
  const query = filters.q?.trim() ?? "";

  const matches = sermons
    // rank: how strong the search match is (lower is stronger); 0 for everyone when there's no search.
    .map((sermon) => {
      const field = query ? matchSermon(sermon, query) : null;
      return { sermon, field, rank: field ? MATCH_FIELD_ORDER.indexOf(field) : 0 };
    })
    .filter(
      ({ sermon, field }) =>
        (!filters.topic || sermon.topic === filters.topic) &&
        (!filters.speaker || sermon.preacher === filters.speaker) &&
        (!filters.book || scriptureBook(sermon.scripture) === filters.book) &&
        (!query || field !== null)
    );

  // Array.prototype.sort is stable, so ties keep the catalogue's own order.
  switch (filters.sort) {
    case "newest":
      matches.sort((a, b) => b.sermon.publishedAt.localeCompare(a.sermon.publishedAt));
      break;
    case "shortest":
      matches.sort((a, b) => a.sermon.durationMinutes - b.sermon.durationMinutes);
      break;
    case "relevance":
      matches.sort((a, b) => a.rank - b.rank);
      break;
  }

  return matches.map(({ sermon }) => sermon);
}

// The choices the filter sheet offers: every speaker and book in the catalogue, alphabetically.
export function sermonFilterOptions(sermons: Sermon[]): SermonFilterOptions {
  const sorted = (values: Iterable<string>) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
  return {
    speakers: sorted(sermons.map((sermon) => sermon.preacher)),
    books: sorted(sermons.map((sermon) => scriptureBook(sermon.scripture))),
  };
}

import type { MatchField, SearchScope, Sermon, SermonSearchResult } from "../types";
import { TOPICS } from "./topics";

// Strongest match first: a title hit outranks a speaker hit, and so on. Results sort in this order.
export const MATCH_FIELD_ORDER: MatchField[] = ["title", "speaker", "scripture", "topic"];

const SCOPE_FIELDS: Record<SearchScope, MatchField[]> = {
  all: MATCH_FIELD_ORDER,
  speaker: ["speaker"],
  scripture: ["scripture"],
};

function fieldText(sermon: Sermon, field: MatchField): string[] {
  switch (field) {
    case "title":
      return [sermon.title];
    case "speaker":
      return [sermon.preacher];
    case "scripture":
      return [sermon.scripture];
    case "topic":
      return [sermon.topic, ...(sermon.relatedTopics ?? [])].map((topic) => TOPICS[topic].label);
  }
}

// The strongest field the query appears in (case-insensitive), or null if none. An empty query matches nothing.
export function matchSermon(sermon: Sermon, query: string, fields: MatchField[] = MATCH_FIELD_ORDER): MatchField | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;
  return fields.find((field) => fieldText(sermon, field).some((text) => text.toLowerCase().includes(needle))) ?? null;
}

// The Search tab: every match within the chosen scope, strongest field first (ties keep catalogue order).
export function searchSermons(sermons: Sermon[], query: string, scope: SearchScope): SermonSearchResult[] {
  const fields = SCOPE_FIELDS[scope];
  return sermons
    .flatMap((sermon) => {
      const matchedIn = matchSermon(sermon, query, fields);
      return matchedIn ? [{ sermon, matchedIn }] : [];
    })
    .sort((a, b) => MATCH_FIELD_ORDER.indexOf(a.matchedIn) - MATCH_FIELD_ORDER.indexOf(b.matchedIn));
}

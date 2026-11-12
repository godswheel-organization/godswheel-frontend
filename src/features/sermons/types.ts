// TODO(backend): replace with the real sermon contract once the Godswheel API spec is available.
export type SermonTopic = "purpose" | "calling" | "faith" | "prayer" | "family" | "worship";

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  scripture: string;
  durationMinutes: number;
  language: string;
  // The main topic (cover art, the card's label); relatedTopics are extra tags on the detail page.
  topic: SermonTopic;
  relatedTopics?: SermonTopic[];
  description: string;
  // Further passages the sermon draws on (the Bible sheet's "In this sermon"), after `scripture` itself.
  scriptureRefs?: string[];
  // Who published it and on what terms, shown under "Source and rights".
  source: { name: string; rights: string };
  // ISO date (YYYY-MM-DD) the sermon was published, for "Newest" sorting and the detail page.
  publishedAt: string;
  // Absent until the API serves audio; the player shows the sermon but cannot play it.
  audioUrl?: string;
}

export type SermonSort = "relevance" | "newest" | "shortest";

export interface SermonFilters {
  q?: string;
  topic?: SermonTopic;
  speaker?: string;
  // Book of the Bible, e.g. "Hebrews" or "1 Samuel".
  book?: string;
  sort: SermonSort;
}

export interface SermonsResponse {
  items: Sermon[];
  total: number;
}

export interface SermonFilterOptions {
  speakers: string[];
  books: string[];
}

// Search results (the Search tab) say which field matched: title, speaker, scripture or topic.
export type MatchField = "title" | "speaker" | "scripture" | "topic";

// What the Search tab's chips limit a search to.
export type SearchScope = "all" | "speaker" | "scripture";

export interface SermonSearchResult {
  sermon: Sermon;
  matchedIn: MatchField;
}

export interface SermonSearchResponse {
  items: SermonSearchResult[];
  total: number;
}

// A sermon category, from GET /categories (live). The list is the API's, so it can change without a release.
export interface SermonCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// How a sermon names its categories, as the API's sermons do.
export type CategoryRef = Pick<SermonCategory, "id" | "name" | "slug">;

// A sermon as the app shows it, made from the API's records by toSermon() (lib/apiSermon.ts).
// GET /sermons lists summaries, so several fields only arrive with the full record (GET /sermons/{id}):
// code reading them handles their absence.
export interface Sermon {
  id: string;
  title: string;
  // The speaker's name.
  preacher: string;
  speakerId?: string;
  // The first is the main one (cover art, the card's label); the rest are extra tags on the detail page.
  categories: CategoryRef[];
  // ISO date or date-time the sermon was published.
  publishedAt?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  // ---- Full record only ----
  // The main passage, e.g. "Matthew 5:27-30".
  scripture?: string;
  // Further passages the sermon draws on (the Bible sheet's "In this sermon"), after `scripture` itself.
  scriptureRefs?: string[];
  language?: string;
  description?: string;
  audioUrl?: string;
  // Who published it and on what terms, shown under "Source and rights". The API doesn't send this yet.
  source?: { name: string; rights: string };
}

// A speaker, from GET /speakers (live).
export interface Speaker {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
}

// The orders GET /sermons offers.
export type SermonSort = "newest" | "oldest";

export interface SermonFilters {
  q?: string;
  // A category slug (?category=).
  category?: string;
  // A speaker id (?speaker=).
  speaker?: string;
  // Book of the Bible, e.g. "Hebrews" or "1 Samuel".
  book?: string;
  sort: SermonSort;
}

// One page of GET /sermons.
export interface SermonPage {
  items: Sermon[];
  total: number;
  hasNextPage: boolean;
}

// Search results (the Search tab) say which field matched.
export type MatchField = "title" | "description" | "speaker" | "scripture";

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

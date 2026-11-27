import type { CategoryRef, Sermon, SermonCategory, SermonFilters, Speaker } from "../types";
import { apiBookName } from "./bibleBooks";

// The GodsWheel API's sermon records (see /api/v1/openapi.json) and their translation into the app's Sermon.

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  totalEntries: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiPage<T> {
  data: T[];
  meta: ApiPaginationMeta;
}

interface ApiScripture {
  reference?: string | null;
  book?: string | null;
  chapter?: number | null;
  startVerse?: number | null;
  endVerse?: number | null;
}

// An item of GET /sermons.
export interface ApiSermonSummary {
  id: string;
  title: string;
  slug?: string;
  speaker: { id: string; name: string } | null;
  categories?: CategoryRef[] | null;
  durationSeconds?: number | null;
  publishedAt?: string | null;
  thumbnailUrl?: string | null;
}

// GET /sermons/{id}: the summary plus the rest.
export interface ApiSermon extends ApiSermonSummary {
  description?: string | null;
  language?: string | null;
  scriptures?: ApiScripture[] | null;
  audioUrl?: string | null;
}

// "Matthew 5:27-30" from its parts, when the API leaves `reference` out.
function referenceOf(scripture: ApiScripture): string | undefined {
  if (scripture.reference?.trim()) return scripture.reference.trim();
  if (!scripture.book) return undefined;
  if (!scripture.chapter) return scripture.book;
  const verses =
    scripture.startVerse == null
      ? ""
      : `:${scripture.startVerse}${scripture.endVerse != null && scripture.endVerse !== scripture.startVerse ? `-${scripture.endVerse}` : ""}`;
  return `${scripture.book} ${scripture.chapter}${verses}`;
}

const text = (value: string | null | undefined) => value?.trim() || undefined;

export function toSermon(api: ApiSermon | ApiSermonSummary): Sermon {
  const full = api as ApiSermon;
  const references = (full.scriptures ?? []).map(referenceOf).filter((ref): ref is string => Boolean(ref));
  const sermon: Sermon = {
    id: api.id,
    title: api.title,
    preacher: api.speaker?.name ?? "Unknown speaker",
    speakerId: api.speaker?.id,
    // Only id, name and slug: detail records also carry each category's description, which no sermon view shows.
    categories: (api.categories ?? []).map(({ id, name, slug }) => ({ id, name, slug })),
    publishedAt: text(api.publishedAt),
    durationSeconds: typeof api.durationSeconds === "number" && api.durationSeconds > 0 ? api.durationSeconds : undefined,
    thumbnailUrl: text(api.thumbnailUrl),
    scripture: references[0],
    scriptureRefs: references.length > 1 ? references.slice(1) : undefined,
    language: text(full.language),
    description: text(full.description),
    audioUrl: text(full.audioUrl),
  };
  // Leave absent fields out entirely, so a summary merged over a full record never blanks it.
  return Object.fromEntries(Object.entries(sermon).filter(([, value]) => value !== undefined)) as unknown as Sermon;
}

// The API's ids are UUIDs; the mock catalogue's are slugs ("arise-and-shine"). Until the mock is gone this tells
// the two apart: an API id is looked up in the API, anything else in the mock.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isApiId = (id: string | null | undefined): id is string => typeof id === "string" && UUID.test(id);

// The page size for lists (the API allows up to 100).
export const SERMON_PAGE_SIZE = 20;

// GET /sermons's query string for Browse's filters. The URL names a category by slug, the API by id, so the
// categories list is needed to translate it; null means the slug isn't a category (so nothing can match).
export function sermonListParams(
  filters: SermonFilters,
  categories: Pick<SermonCategory, "id" | "slug">[]
): Record<string, string> | null {
  const params: Record<string, string> = { sort: filters.sort };
  if (filters.q?.trim()) params.search = filters.q.trim();
  if (filters.category) {
    const category = categories.find((candidate) => candidate.slug === filters.category);
    if (!category) return null;
    params.category_id = category.id;
  }
  if (filters.speaker) params.speaker_id = filters.speaker;
  if (filters.book) params.scripture = apiBookName(filters.book);
  return params;
}

// Speakers whose name contains the words typed, e.g. "allan" → Dr Allan Brown. For the Search tab's speaker scope
// (the API's own search covers titles and descriptions only).
export function speakersMatching(speakers: Speaker[], query: string): Speaker[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return speakers.filter((speaker) => {
    const name = speaker.name.toLowerCase();
    return words.every((word) => name.includes(word));
  });
}

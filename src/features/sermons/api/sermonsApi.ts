import { createApi, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import { apiScripture, isScriptureSearch } from "../lib/bibleBooks";
import {
  SERMON_PAGE_SIZE,
  speakersMatching,
  toSermon,
  type ApiPage,
  type ApiSermon,
  type ApiSermonSummary,
} from "../lib/apiSermon";
import type { SearchQuery } from "../lib/searchQuery";
import type {
  MatchField,
  Sermon,
  SermonCategory,
  SermonPage,
  SermonSearchResponse,
  SermonSearchResult,
  Speaker,
} from "../types";

type Fetch = (args: string | FetchArgs) => ReturnType<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>;
type Outcome<T> = { data: T } | { error: FetchBaseQueryError };

// The API pages its lists (at most 100 per page). Categories and speakers are few, but every page is read.
const FULL_LIST_LIMIT = 100;
const MAX_LIST_PAGES = 10;
// The Search tab shows one long page per kind of match rather than paging.
const SEARCH_LIMIT = 100;

async function fetchAllPages<T>(fetch: Fetch, url: string): Promise<Outcome<T[]>> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const result = await fetch({ url, params: { page, limit: FULL_LIST_LIMIT } });
    if (result.error) return { error: result.error };
    const { data, meta } = result.data as ApiPage<T>;
    items.push(...data);
    if (!meta?.hasNextPage) break;
  }
  return { data: items };
}

// One search request. A 422 (e.g. "grace" as a scripture reference) means nothing matches, not a failure.
async function searchPage(fetch: Fetch, params: Record<string, string>): Promise<Outcome<Sermon[]>> {
  const result = await fetch({ url: "/sermons", params: { ...params, limit: SEARCH_LIMIT } });
  if (result.error) return result.error.status === 422 ? { data: [] } : { error: result.error };
  return { data: (result.data as ApiPage<ApiSermonSummary>).data.map(toSermon) };
}

// Every endpoint here is the live API's (see LIVE_ENDPOINTS in lib/api/baseQuery.ts).
export const sermonsApi = createApi({
  reducerPath: "sermonsApi",
  baseQuery,
  tagTypes: [API_TAGS.Sermon],
  endpoints: (builder) => ({
    // Every sermon category, in the API's order. Kept for five minutes, as on the server (getCategories.ts).
    getCategories: builder.query<SermonCategory[], void>({
      queryFn: (_arg, _api, _extraOptions, fetch) => fetchAllPages<SermonCategory>(fetch, "/categories"),
      keepUnusedDataFor: 5 * 60,
    }),

    // Every speaker, for the filter sheet and the Search tab's speaker scope.
    getSpeakers: builder.query<Speaker[], void>({
      queryFn: (_arg, _api, _extraOptions, fetch) => fetchAllPages<Speaker>(fetch, "/speakers"),
      keepUnusedDataFor: 60 * 60,
    }),

    // Browse: GET /sermons a page at a time ("Load more"). The argument is the API's own query string
    // (search, category_id, speaker_id, scripture, sort), built by sermonListParams().
    getSermons: builder.infiniteQuery<SermonPage, Record<string, string>, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => (lastPage.hasNextPage ? lastPageParam + 1 : undefined),
      },
      query: ({ queryArg, pageParam }) => ({ url: "/sermons", params: { ...queryArg, page: pageParam, limit: SERMON_PAGE_SIZE } }),
      transformResponse: ({ data, meta }: ApiPage<ApiSermonSummary>): SermonPage => ({
        items: data.map(toSermon),
        total: meta.totalEntries,
        hasNextPage: meta.hasNextPage,
      }),
      providesTags: [API_TAGS.Sermon],
    }),

    // One sermon's full record: the player loads it for a sermon started from a list (audio, passages).
    getSermon: builder.query<Sermon, string>({
      query: (id) => `/sermons/${encodeURIComponent(id)}`,
      transformResponse: ({ data }: { data: ApiSermon }) => toSermon(data),
      providesTags: [API_TAGS.Sermon],
    }),

    // A playable address for a sermon's audio: short-lived (presigned) once the API's storage is private, so it's
    // fetched as playback starts and again if it has expired (see PlaybackEngine).
    getSermonAudio: builder.query<{ url: string; expiresAt: string | null }, string>({
      query: (id) => `/sermons/${encodeURIComponent(id)}/audio`,
      transformResponse: ({ data }: { data: { url: string; expiresAt: string | null } }) => data,
      keepUnusedDataFor: 60,
    }),

    // The Search tab. The API searches titles and descriptions; speakers are matched by name (then filtered by
    // id) and passages through its scripture filter. "All" runs whichever of those the words could be, and lists
    // title matches first, then speaker, scripture and description matches, each sermon once.
    searchSermons: builder.query<SermonSearchResponse, SearchQuery>({
      async queryFn({ q, scope }, _api, _extraOptions, fetch) {
        const query = q.trim();
        const found: { field: MatchField | "text"; sermons: Sermon[] }[] = [];

        if (scope === "all") {
          const text = await searchPage(fetch, { search: query });
          if ("error" in text) return text;
          found.push({ field: "text", sermons: text.data });
        }
        if (scope === "all" || scope === "speaker") {
          const speakers = await fetchAllPages<Speaker>(fetch, "/speakers");
          if ("error" in speakers) return speakers;
          for (const speaker of speakersMatching(speakers.data, query)) {
            const bySpeaker = await searchPage(fetch, { speaker_id: speaker.id });
            if ("error" in bySpeaker) return bySpeaker;
            found.push({ field: "speaker", sermons: bySpeaker.data });
          }
        }
        if (scope === "scripture" || (scope === "all" && isScriptureSearch(query))) {
          const byScripture = await searchPage(fetch, { scripture: apiScripture(query) });
          if ("error" in byScripture) return byScripture;
          found.push({ field: "scripture", sermons: byScripture.data });
        }

        const words = query.toLowerCase();
        const ranked: Record<MatchField, SermonSearchResult[]> = { title: [], speaker: [], scripture: [], description: [] };
        const seen = new Set<string>();
        for (const { field, sermons } of found) {
          for (const sermon of sermons) {
            if (seen.has(sermon.id)) continue;
            seen.add(sermon.id);
            // The API doesn't say which of title and description matched; the title is checked here.
            const matchedIn = field === "text" ? (sermon.title.toLowerCase().includes(words) ? "title" : "description") : field;
            ranked[matchedIn].push({ sermon, matchedIn });
          }
        }
        const items = [...ranked.title, ...ranked.speaker, ...ranked.scripture, ...ranked.description];
        return { data: { items, total: items.length } };
      },
      providesTags: [API_TAGS.Sermon],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetSpeakersQuery,
  useGetSermonsInfiniteQuery,
  useGetSermonQuery,
  useGetSermonAudioQuery,
  useSearchSermonsQuery,
} = sermonsApi;

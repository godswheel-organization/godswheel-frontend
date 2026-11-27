import { createApi } from "@reduxjs/toolkit/query/react";
import { isApiId, toSermon, type ApiPage, type ApiSermonSummary } from "@/features/sermons/lib/apiSermon";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { HistoryEntry, RecordProgressRequest, SavedSermon, SermonProgress } from "../types";

const sermonUrl = (sermonId: string, rest: string) => `/sermons/${encodeURIComponent(sermonId)}/${rest}`;

// Saved sermons are read in pages of 100, up to this many pages.
const BOOKMARK_PAGE_LIMIT = 100;
const MAX_BOOKMARK_PAGES = 10;

// Everything per-user about listening. Requires a session.
// Live: bookmarks (GET /sermon-bookmarks, POST/DELETE /sermons/{id}/bookmark) and playback progress
// (GET/PUT /sermons/{id}/progress). Mock: the history list (/history), which the API has no endpoint for yet.
export const libraryApi = createApi({
  reducerPath: "libraryApi",
  baseQuery,
  tagTypes: [API_TAGS.Library, API_TAGS.History],
  endpoints: (builder) => ({
    getSavedSermons: builder.query<SavedSermon[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const saved: SavedSermon[] = [];
        for (let page = 1; page <= MAX_BOOKMARK_PAGES; page++) {
          const result = await fetchWithBaseQuery({ url: "/sermon-bookmarks", params: { page, limit: BOOKMARK_PAGE_LIMIT } });
          if (result.error) return { error: result.error };
          const { data, meta } = result.data as ApiPage<ApiSermonSummary>;
          saved.push(...data.map((sermon) => ({ sermon: toSermon(sermon) })));
          if (!meta?.hasNextPage) break;
        }
        return { data: saved };
      },
      providesTags: [API_TAGS.Library],
    }),

    // Both toggle the bookmark immediately (optimistic), and put it back if the server says no.
    saveSermon: builder.mutation<null, SavedSermon["sermon"]>({
      async queryFn(sermon, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery({ url: sermonUrl(sermon.id, "bookmark"), method: "POST" });
        // 409 would mean it's saved already, which is what was asked for.
        return result.error && result.error.status !== 409 ? { error: result.error } : { data: null };
      },
      async onQueryStarted(sermon, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getSavedSermons", undefined, (saved) => {
            if (!saved.some((item) => item.sermon.id === sermon.id)) saved.unshift({ sermon, savedAt: new Date().toISOString() });
          })
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: [API_TAGS.Library],
    }),

    unsaveSermon: builder.mutation<null, string>({
      async queryFn(sermonId, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery({ url: sermonUrl(sermonId, "bookmark"), method: "DELETE" });
        // 404 "Bookmark not found": it's already gone.
        return result.error && result.error.status !== 404 ? { error: result.error } : { data: null };
      },
      async onQueryStarted(sermonId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getSavedSermons", undefined, (saved) => saved.filter((item) => item.sermon.id !== sermonId))
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: [API_TAGS.Library],
    }),

    // Where the listener left a sermon, on any device; null if never played.
    getProgress: builder.query<SermonProgress | null, string>({
      query: (sermonId) => sermonUrl(sermonId, "progress"),
      transformResponse: ({ data }: { data: SermonProgress | null }) => data,
      keepUnusedDataFor: 0,
    }),

    getHistory: builder.query<HistoryEntry[], void>({
      query: () => "/history",
      providesTags: [API_TAGS.History],
    }),

    // Saves the position to the API (so other devices can resume) and to this device's history list. Either
    // failing is reported, but the other still counts.
    recordProgress: builder.mutation<null, RecordProgressRequest>({
      async queryFn({ sermonId, positionSeconds }, _api, _extraOptions, fetchWithBaseQuery) {
        const position = Math.max(0, Math.round(positionSeconds));
        const [live, history] = await Promise.all([
          isApiId(sermonId)
            ? fetchWithBaseQuery({ url: sermonUrl(sermonId, "progress"), method: "PUT", body: { position_seconds: position } })
            : Promise.resolve({ error: undefined }),
          fetchWithBaseQuery({ url: `/history/${encodeURIComponent(sermonId)}`, method: "PUT", body: { positionSeconds: position } }),
        ]);
        const error = live.error ?? history.error;
        return error ? { error } : { data: null };
      },
      invalidatesTags: [API_TAGS.History],
    }),

    removeFromHistory: builder.mutation<void, string>({
      query: (sermonId) => ({ url: `/history/${encodeURIComponent(sermonId)}`, method: "DELETE" }),
      invalidatesTags: [API_TAGS.History],
    }),

    clearHistory: builder.mutation<void, void>({
      query: () => ({ url: "/history", method: "DELETE" }),
      invalidatesTags: [API_TAGS.History],
    }),
  }),
});

export const {
  useGetSavedSermonsQuery,
  useSaveSermonMutation,
  useUnsaveSermonMutation,
  useLazyGetProgressQuery,
  useGetHistoryQuery,
  useRecordProgressMutation,
  useRemoveFromHistoryMutation,
  useClearHistoryMutation,
} = libraryApi;

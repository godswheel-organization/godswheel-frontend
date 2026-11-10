import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { HistoryEntry, RecordProgressRequest, SavedSermon } from "../types";

// Everything per-user about listening: saved sermons and history. Requires a session.
// TODO(backend): paths are what the mock backend (lib/api/mock) answers; align with the real spec.
export const libraryApi = createApi({
  reducerPath: "libraryApi",
  baseQuery,
  tagTypes: [API_TAGS.Library, API_TAGS.History],
  endpoints: (builder) => ({
    getSavedSermons: builder.query<SavedSermon[], void>({
      query: () => "/library/sermons",
      providesTags: [API_TAGS.Library],
    }),

    // Both toggle the bookmark immediately (optimistic), and put it back if the server says no.
    saveSermon: builder.mutation<void, SavedSermon["sermon"]>({
      query: (sermon) => ({ url: `/library/sermons/${encodeURIComponent(sermon.id)}`, method: "PUT" }),
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

    unsaveSermon: builder.mutation<void, string>({
      query: (sermonId) => ({ url: `/library/sermons/${encodeURIComponent(sermonId)}`, method: "DELETE" }),
      async onQueryStarted(sermonId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getSavedSermons", undefined, (saved) => saved.filter((item) => item.sermon.id !== sermonId))
        );
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: [API_TAGS.Library],
    }),

    getHistory: builder.query<HistoryEntry[], void>({
      query: () => "/history",
      providesTags: [API_TAGS.History],
    }),

    recordProgress: builder.mutation<void, RecordProgressRequest>({
      query: ({ sermonId, positionSeconds }) => ({
        url: `/history/${encodeURIComponent(sermonId)}`,
        method: "PUT",
        body: { positionSeconds },
      }),
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
  useGetHistoryQuery,
  useRecordProgressMutation,
  useRemoveFromHistoryMutation,
  useClearHistoryMutation,
} = libraryApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { SaveNoteRequest, SermonNote } from "../types";

const noteUrl = (sermonId: string) => `/notes/${encodeURIComponent(sermonId)}`;

// One note per sermon, so each sermon's note lives at its own URL.
// TODO(backend): paths are what the mock backend (lib/api/mock) answers; align with the real spec.
export const notesApi = createApi({
  reducerPath: "notesApi",
  baseQuery,
  tagTypes: [API_TAGS.Notes],
  endpoints: (builder) => ({
    // null = no note yet. The API answers 404 for that, which here is an ordinary empty state, not an error.
    getNote: builder.query<SermonNote | null, string>({
      async queryFn(sermonId, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(noteUrl(sermonId));
        if (result.error?.status === 404) return { data: null };
        return result.error ? { error: result.error } : { data: result.data as SermonNote };
      },
      providesTags: (_result, _error, sermonId) => [{ type: API_TAGS.Notes, id: sermonId }],
    }),

    // Creates the sermon's note, or replaces its text.
    saveNote: builder.mutation<SermonNote, SaveNoteRequest>({
      query: ({ sermonId, atSeconds, text }) => ({ url: noteUrl(sermonId), method: "PUT", body: { atSeconds, text } }),
      // Show the saved note straight away instead of waiting for a refetch.
      async onQueryStarted({ sermonId }, { dispatch, queryFulfilled }) {
        const { data: note } = await queryFulfilled;
        dispatch(notesApi.util.upsertQueryData("getNote", sermonId, note));
      },
    }),

    deleteNote: builder.mutation<void, string>({
      query: (sermonId) => ({ url: noteUrl(sermonId), method: "DELETE" }),
      async onQueryStarted(sermonId, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(notesApi.util.upsertQueryData("getNote", sermonId, null));
      },
    }),
  }),
});

export const { useGetNoteQuery, useSaveNoteMutation, useDeleteNoteMutation } = notesApi;

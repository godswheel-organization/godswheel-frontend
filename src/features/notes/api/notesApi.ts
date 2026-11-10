import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { AddNoteRequest, SermonNote } from "../types";

// TODO(backend): paths are what the mock backend (lib/api/mock) answers; align with the real spec.
export const notesApi = createApi({
  reducerPath: "notesApi",
  baseQuery,
  tagTypes: [API_TAGS.Notes],
  endpoints: (builder) => ({
    getNotes: builder.query<SermonNote[], string>({
      query: (sermonId) => ({ url: "/notes", params: { sermonId } }),
      providesTags: (_result, _error, sermonId) => [{ type: API_TAGS.Notes, id: sermonId }],
    }),

    addNote: builder.mutation<SermonNote, AddNoteRequest>({
      query: (body) => ({ url: "/notes", method: "POST", body }),
      invalidatesTags: (_result, _error, { sermonId }) => [{ type: API_TAGS.Notes, id: sermonId }],
    }),
  }),
});

export const { useGetNotesQuery, useAddNoteMutation } = notesApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import { markdownToNoteDoc, noteDocToMarkdown, noteDocToText } from "../lib/noteMarkdown";
import type { SaveNoteRequest, SermonNote } from "../types";

const noteUrl = (sermonId: string) => `/sermons/${encodeURIComponent(sermonId)}/note`;

// The API's note: one per sermon per user, its body a single string (Markdown here, see lib/noteMarkdown.ts).
interface ApiNote {
  sermonId: string;
  content: string;
  insertedAt: string;
  updatedAt: string;
}

// null for no note, including an emptied one (the API has no delete; see deleteNote).
function toNote(api: ApiNote | null): SermonNote | null {
  if (!api?.content?.trim()) return null;
  const doc = markdownToNoteDoc(api.content);
  return { id: api.sermonId, sermonId: api.sermonId, text: noteDocToText(doc), doc, createdAt: api.insertedAt, updatedAt: api.updatedAt };
}

// Live: GET and PATCH /sermons/{id}/note.
export const notesApi = createApi({
  reducerPath: "notesApi",
  baseQuery,
  tagTypes: [API_TAGS.Notes],
  endpoints: (builder) => ({
    // null = no note yet, an ordinary empty state.
    getNote: builder.query<SermonNote | null, string>({
      async queryFn(sermonId, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery(noteUrl(sermonId));
        // 404: no such sermon (e.g. one from the old mock catalogue), so certainly no note.
        if (result.error?.status === 404) return { data: null };
        return result.error ? { error: result.error } : { data: toNote((result.data as { data: ApiNote | null }).data) };
      },
      providesTags: (_result, _error, sermonId) => [{ type: API_TAGS.Notes, id: sermonId }],
    }),

    // Creates the sermon's note, or replaces it. The note sheet calls this as you type (autosave).
    saveNote: builder.mutation<SermonNote | null, SaveNoteRequest>({
      query: ({ sermonId, doc }) => ({ url: noteUrl(sermonId), method: "PATCH", body: { content: noteDocToMarkdown(doc) } }),
      transformResponse: ({ data }: { data: ApiNote | null }) => toNote(data),
      // Show the saved note straight away instead of waiting for a refetch.
      // (A failed save rejects queryFulfilled; the caller reports it, so it's caught here rather than left unhandled.)
      async onQueryStarted({ sermonId }, { dispatch, queryFulfilled }) {
        const outcome = await queryFulfilled.catch(() => null);
        if (outcome) dispatch(notesApi.util.upsertQueryData("getNote", sermonId, outcome.data));
      },
    }),

    // The API has no DELETE for notes, so a note is removed by saving it empty, which reads back as no note.
    deleteNote: builder.mutation<null, string>({
      query: (sermonId) => ({ url: noteUrl(sermonId), method: "PATCH", body: { content: "" } }),
      transformResponse: () => null,
      async onQueryStarted(sermonId, { dispatch, queryFulfilled }) {
        if (await queryFulfilled.then(() => true, () => false)) {
          dispatch(notesApi.util.upsertQueryData("getNote", sermonId, null));
        }
      },
    }),
  }),
});

export const { useGetNoteQuery, useSaveNoteMutation, useDeleteNoteMutation } = notesApi;

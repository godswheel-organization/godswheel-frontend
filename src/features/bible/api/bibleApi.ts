import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import type { BiblePassage, BibleVersion } from "../types";

// Scripture text is public and never changes, so it's cached for the whole session.
// TODO(backend): paths are what the mock backend (lib/api/mock) answers; align with the real spec.
export const bibleApi = createApi({
  reducerPath: "bibleApi",
  baseQuery,
  keepUnusedDataFor: 60 * 60,
  endpoints: (builder) => ({
    getBibleVersions: builder.query<BibleVersion[], void>({
      query: () => "/bible/versions",
    }),

    getPassage: builder.query<BiblePassage, { reference: string; version: string }>({
      query: ({ reference, version }) => ({ url: "/bible/passage", params: { ref: reference, version } }),
    }),
  }),
});

export const { useGetBibleVersionsQuery, useGetPassageQuery } = bibleApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { SearchQuery } from "../lib/searchQuery";
import { toSermonSearchParams } from "../lib/sermonFilters";
import type { SermonFilterOptions, SermonFilters, SermonSearchResponse, SermonsResponse } from "../types";

// TODO(backend): paths and query names are what the mock backend (lib/api/mock) answers; align with the real spec.
export const sermonsApi = createApi({
  reducerPath: "sermonsApi",
  baseQuery,
  tagTypes: [API_TAGS.Sermon],
  endpoints: (builder) => ({
    // Same query string as the Browse URL (?q=&topic=&speaker=&book=&sort=).
    getSermons: builder.query<SermonsResponse, SermonFilters>({
      query: (filters) => ({ url: "/sermons", params: Object.fromEntries(toSermonSearchParams(filters)) }),
      providesTags: [API_TAGS.Sermon],
    }),

    // The Search tab: matches plus where each matched (title, speaker, scripture or topic).
    searchSermons: builder.query<SermonSearchResponse, SearchQuery>({
      query: ({ q, scope }) => ({ url: "/sermons/search", params: { q, in: scope } }),
      providesTags: [API_TAGS.Sermon],
    }),

    getSermonFilterOptions: builder.query<SermonFilterOptions, void>({
      query: () => "/sermons/filter-options",
      providesTags: [API_TAGS.Sermon],
    }),
  }),
});

export const { useGetSermonsQuery, useSearchSermonsQuery, useGetSermonFilterOptionsQuery } = sermonsApi;

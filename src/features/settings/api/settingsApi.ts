import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { UserSettings } from "../types";

// TODO(backend): paths are what the mock backend (lib/api/mock) answers; align with the real spec.
export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery,
  tagTypes: [API_TAGS.Settings],
  endpoints: (builder) => ({
    getSettings: builder.query<UserSettings, void>({
      query: () => "/me/settings",
      providesTags: [API_TAGS.Settings],
    }),

    updateSettings: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (body) => ({ url: "/me/settings", method: "PATCH", body }),
      // Flip the switch at once; put it back if the server refuses.
      async onQueryStarted(changes, { dispatch, queryFulfilled }) {
        const patch = dispatch(settingsApi.util.updateQueryData("getSettings", undefined, (settings) => ({ ...settings, ...changes })));
        queryFulfilled.catch(patch.undo);
      },
      invalidatesTags: [API_TAGS.Settings],
    }),

    // "Request a copy of my data". Fetched on demand, never cached.
    exportMyData: builder.mutation<unknown, void>({
      query: () => ({ url: "/me/export", method: "GET" }),
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation, useExportMyDataMutation } = settingsApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { AuthSession, SignInRequest } from "../types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: [API_TAGS.Auth],
  endpoints: (builder) => ({
    signIn: builder.mutation<void, SignInRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: [API_TAGS.Auth],
    }),

    getSession: builder.query<AuthSession, void>({
      query: () => "/auth/session",
      providesTags: [API_TAGS.Auth],
    }),

    signOut: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: [API_TAGS.Auth],
    }),
  }),
});

export const { useSignInMutation, useGetSessionQuery, useSignOutMutation } = authApi;

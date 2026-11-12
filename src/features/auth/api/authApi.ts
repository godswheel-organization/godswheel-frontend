import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import type { AuthSession, PasswordResetRequest, SignInRequest, SignUpRequest } from "../types";

// TODO(backend): endpoint paths are placeholders until the Godswheel API spec is available.
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: [API_TAGS.Auth],
  endpoints: (builder) => ({
    signIn: builder.mutation<void, SignInRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: [API_TAGS.Auth],
    }),

    // Assumes the backend signs the new user in (sets the session cookie) on success.
    signUp: builder.mutation<void, SignUpRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: [API_TAGS.Auth],
    }),

    // Emails a reset link if an account exists. The answer is the same either way (see authErrors).
    requestPasswordReset: builder.mutation<void, PasswordResetRequest>({
      query: (body) => ({ url: "/auth/password/forgot", method: "POST", body }),
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

export const {
  useSignInMutation,
  useSignUpMutation,
  useRequestPasswordResetMutation,
  useGetSessionQuery,
  useSignOutMutation,
} = authApi;

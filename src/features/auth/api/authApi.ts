import { createApi, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import { API_TAGS } from "@/lib/api/apiTags";
import { clearSession, getAccessToken, getSessionIdentity, saveSession, setSessionIdentity } from "@/lib/api/auth/accessToken";
import { toAuthSession } from "../lib/session";
import type {
  ApiEnvelope,
  AuthSession,
  ChangePasswordRequest,
  EmailRequest,
  LoginResult,
  PasswordResetRequest,
  PublicUser,
  ResetPasswordRequest,
  SignInRequest,
  SignUpRequest,
  SignUpResult,
  TokenRequest,
} from "../types";

// Endpoints marked "Live" call the GodsWheel API (see LIVE_ENDPOINTS in lib/api/baseQuery.ts); the rest are still
// answered by the in-browser mock. TODO(backend): password reset and change still use placeholder paths.
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: [API_TAGS.Auth],
  endpoints: (builder) => ({
    // Live. Unverified accounts are refused (403). On success the session is saved on this device (it lasts until
    // the user signs out) and filled from the response, so no extra /auth/me call is needed.
    signIn: builder.mutation<AuthSession, SignInRequest>({
      queryFn: (body, _api, _extraOptions, fetchWithBaseQuery) =>
        startSession(fetchWithBaseQuery({ url: "/auth/login", method: "POST", body })),
      onQueryStarted: (_body, lifecycle) => fillSessionCache(lifecycle),
    }),

    // Live. Opens the link from the verification email: spends its single-use token, and signs the user in with the
    // same session login gives. Fails with 422 when the token is invalid, expired or already used.
    verifyEmail: builder.mutation<AuthSession, TokenRequest>({
      queryFn: (body, _api, _extraOptions, fetchWithBaseQuery) =>
        startSession(fetchWithBaseQuery({ url: "/auth/verify-email", method: "POST", body })),
      onQueryStarted: (_body, lifecycle) => fillSessionCache(lifecycle),
    }),

    // Live (GodsWheel API). Creates an unverified account and emails a verification link. It does NOT sign the
    // user in: no session exists until the email is verified, so the sign-up page shows "Check your email".
    signUp: builder.mutation<SignUpResult, SignUpRequest>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<SignUpResult>) => response.data,
    }),

    // Live. Sends a fresh verification link if an unverified account exists; the answer is the same either way.
    resendVerification: builder.mutation<void, EmailRequest>({
      query: (body) => ({ url: "/auth/resend-verification", method: "POST", body }),
    }),

    // Live. Emails a reset link if a verified account exists. The answer is the same either way (see authErrors),
    // so it can't be used to find out who has an account.
    requestPasswordReset: builder.mutation<void, PasswordResetRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    // Live. Spends the single-use token from the reset email and sets the new password. It doesn't sign the user
    // in; they sign in with the new password. Fails with 422 for a bad token or password.
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    // Live. Signed-in users only (Bearer token). Checks the current password first: a wrong one is a 403, not a
    // 401, so it never ends the session. On success this session stays signed in and every other one is revoked.
    // See changePasswordErrorMessage for the failures.
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: ({ currentPassword, newPassword }) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: { current_password: currentPassword, new_password: newPassword },
      }),
    }),

    // Live. Who's signed in, or null for a guest (who makes no call at all). With a saved session it asks GET
    // /auth/me, which also catches a token the API has revoked (401: then, and only then, the session ends here).
    // If the API can't be reached (offline, server trouble) the user stays signed in as the saved session says.
    getSession: builder.query<AuthSession | null, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        if (!getAccessToken()) return { data: null };
        const result = await fetchWithBaseQuery("/auth/me");
        if (result.error?.status === 401) {
          clearSession();
          return { data: null };
        }
        if (result.error) {
          const saved = getSessionIdentity();
          return saved ? { data: toAuthSession(saved) } : { error: result.error };
        }
        const user = (result.data as ApiEnvelope<PublicUser>).data;
        setSessionIdentity(user);
        return { data: toAuthSession(user) };
      },
      providesTags: [API_TAGS.Auth],
    }),

    // Live. The only way a session ends on purpose: revokes the token on the API, and this device forgets it even if
    // the API can't be reached, so signing out always works here.
    signOut: builder.mutation<null, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        await fetchWithBaseQuery({ url: "/auth/logout", method: "POST" });
        clearSession();
        // null, not undefined: RTK Query reads an undefined `data` as a malformed result.
        return { data: null };
      },
      invalidatesTags: [API_TAGS.Auth],
    }),

    // Live. Revokes every session the account has (all devices, this one included). Unlike signOut it has to
    // reach the API, or the other devices would stay signed in, so a failure is reported and nothing is cleared.
    signOutEverywhere: builder.mutation<null, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBaseQuery) {
        const result = await fetchWithBaseQuery({ url: "/auth/logout-all", method: "POST" });
        // 401: this token was already revoked, so the account is signed out here at least.
        if (result.error && result.error.status !== 401) return { error: result.error };
        clearSession();
        return { data: null };
      },
      invalidatesTags: [API_TAGS.Auth],
    }),
  }),
});

type BaseQueryResult = { data?: unknown; error?: FetchBaseQueryError };

// Login and email verification both answer with a session ({ user, accessToken, tokenType, issuedAt }). Save it
// before the caller's await resolves, so whatever runs next is already signed in.
async function startSession(request: BaseQueryResult | PromiseLike<BaseQueryResult>): Promise<{ data: AuthSession } | { error: FetchBaseQueryError }> {
  const result = await request;
  if (result.error) return { error: result.error };
  const { user, accessToken } = (result.data as ApiEnvelope<LoginResult>).data;
  saveSession(accessToken, user);
  return { data: toAuthSession(user) };
}

// Fills the session cache straight away, so every useSession() updates without a refetch. queryFulfilled rejects
// when the call fails; that's the screen's to report, so it's caught here rather than left unhandled.
async function fillSessionCache({
  dispatch,
  queryFulfilled,
}: {
  dispatch: (action: unknown) => unknown;
  queryFulfilled: Promise<{ data: AuthSession }>;
}) {
  const outcome = await queryFulfilled.catch(() => null);
  if (outcome) dispatch(authApi.util.upsertQueryData("getSession", undefined, outcome.data));
}

export const {
  useSignInMutation,
  useVerifyEmailMutation,
  useSignUpMutation,
  useResendVerificationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetSessionQuery,
  useSignOutMutation,
  useSignOutEverywhereMutation,
} = authApi;

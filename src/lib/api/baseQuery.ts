import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/lib/env";
import { getAccessToken, hasAccessToken } from "./auth/accessToken";
import { API_BASE_URL } from "./auth/apiBase";
import { refreshAccessToken } from "./auth/refreshAccessToken";

// Fired on a 401 outside /auth so a session watcher can re-check the session.
export const UNAUTHORIZED_EVENT = "godswheel:unauthorized";

// Caps the event rate so a burst of failures isn't a burst of session checks.
const UNAUTHORIZED_EVENT_GAP_MS = 2000;
let lastUnauthorizedEventAt = 0;

type AppBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

function csrfHeaders(headers: Headers) {
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  return headers;
}

// A 401 means the session ended (no refresh), so announce it instead of letting each screen fail.
function withUnauthorizedEvent(rawQuery: AppBaseQuery): AppBaseQuery {
  return async (args, api, extraOptions) => {
    const result = await rawQuery(args, api, extraOptions);
    const url = typeof args === "string" ? args : args.url;
    if (result.error?.status === 401 && !url.startsWith("/auth/") && typeof window !== "undefined") {
      const now = Date.now();
      if (now - lastUnauthorizedEventAt > UNAUTHORIZED_EVENT_GAP_MS) {
        lastUnauthorizedEventAt = now;
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }
    return result;
  };
}

// The real backend, through this app's /api/v1 proxy (see auth/apiBase.ts): the access token as a Bearer header,
// and credentials so the refresh cookie travels with /auth/refresh and /auth/logout.
const rawHttpBaseQuery: AppBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();
    if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
    return csrfHeaders(headers);
  },
});

// Calls that don't use the access token: no refreshing around them (and a 401 from login means a wrong password,
// not an expired session).
const PUBLIC_AUTH_PATHS = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/signup",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
]);

const pathOf = (args: string | FetchArgs) => (typeof args === "string" ? args : args.url).split("?")[0];

// Keeps the access token fresh around each call: a token that has lapsed is refreshed before sending, and a 401
// on a call that carried a token (expired early, or revoked) gets one refresh and one retry.
const httpBaseQuery: AppBaseQuery = async (args, api, extraOptions) => {
  if (PUBLIC_AUTH_PATHS.has(pathOf(args))) return rawHttpBaseQuery(args, api, extraOptions);

  if (hasAccessToken() && !getAccessToken()) await refreshAccessToken();
  const sentWithToken = getAccessToken() !== null;
  const result = await rawHttpBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && sentWithToken && (await refreshAccessToken()) === "refreshed") {
    return rawHttpBaseQuery(args, api, extraOptions);
  }
  return result;
};

// The in-browser mock backend (dummy data until the real one exists). Loaded on first use, so a build
// with NEXT_PUBLIC_USE_MOCK_API=false never downloads the mock or its data.
const mockBaseQuery: AppBaseQuery = async (args, api, extraOptions) =>
  (await import("./mock/mockBaseQuery")).mockBaseQuery(args, api, extraOptions);

// Endpoints already integrated with the real GodsWheel API, as "METHOD /path" (relative to the API base URL).
// They call the API even while the mock answers everything else. Add each endpoint here as it's wired up;
// once all are, set NEXT_PUBLIC_USE_MOCK_API=false and delete the mock.
// (POST /auth/refresh is live too, but called directly by auth/refreshAccessToken.ts, not through here.)
export const LIVE_ENDPOINTS = new Set([
  "POST /auth/signup",
  "POST /auth/resend-verification",
  "POST /auth/login",
  "POST /auth/verify-email",
  "POST /auth/forgot-password",
  "POST /auth/reset-password",
  "PUT /auth/change-password",
  "GET /auth/me",
  "POST /auth/logout",
]);

export function isLiveEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === "string" ? args : args.url;
  const method = (typeof args === "string" ? "GET" : (args.method ?? "GET")).toUpperCase();
  return LIVE_ENDPOINTS.has(`${method} ${url.split("?")[0]}`);
}

const hybridBaseQuery: AppBaseQuery = (args, api, extraOptions) =>
  (isLiveEndpoint(args) ? httpBaseQuery : mockBaseQuery)(args, api, extraOptions);

// Every feature's api slice uses this; NEXT_PUBLIC_USE_MOCK_API picks whether unintegrated endpoints use the mock.
export const baseQuery: AppBaseQuery = withUnauthorizedEvent(
  env.NEXT_PUBLIC_USE_MOCK_API ? hybridBaseQuery : httpBaseQuery,
);

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)godswheel_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

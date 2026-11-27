import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/lib/env";
import { getAccessToken } from "./auth/accessToken";
import { API_BASE_URL } from "./auth/apiBase";

// Fired on a 401 outside /auth so the session watcher asks GET /auth/me whether the token is still good.
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

// A 401 may mean the API revoked the token, so announce it; the session check decides, not each screen.
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

// The real backend, through this app's /api/v1 proxy (see auth/apiBase.ts), with the saved access token as a
// Bearer header. Tokens don't expire and there's no refresh, so there's nothing to renew or retry around a call.
const httpBaseQuery: AppBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();
    if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
    return csrfHeaders(headers);
  },
});

// The in-browser mock backend (dummy data until the real one exists). Loaded on first use, so a build
// with NEXT_PUBLIC_USE_MOCK_API=false never downloads the mock or its data.
const mockBaseQuery: AppBaseQuery = async (args, api, extraOptions) =>
  (await import("./mock/mockBaseQuery")).mockBaseQuery(args, api, extraOptions);

// Endpoints already integrated with the real GodsWheel API, as "METHOD /path" (relative to the API base URL);
// ":name" stands for one path segment. They call the API even while the mock answers everything else. Add each
// endpoint here as it's wired up; once all are, set NEXT_PUBLIC_USE_MOCK_API=false and delete the mock.
export const LIVE_ENDPOINTS = [
  "POST /auth/signup",
  "POST /auth/resend-verification",
  "POST /auth/login",
  "POST /auth/verify-email",
  "POST /auth/forgot-password",
  "POST /auth/reset-password",
  "PUT /auth/change-password",
  "GET /auth/me",
  "POST /auth/logout",
  "POST /auth/logout-all",
  "GET /categories",
  "GET /speakers",
  "GET /sermons",
  "GET /sermons/:id",
  "GET /sermons/:id/audio",
  "GET /sermon-bookmarks",
  "POST /sermons/:id/bookmark",
  "DELETE /sermons/:id/bookmark",
  "GET /sermons/:id/note",
  "PATCH /sermons/:id/note",
  "GET /sermons/:id/progress",
  "PUT /sermons/:id/progress",
];

const LIVE_ENDPOINT_PATTERNS = LIVE_ENDPOINTS.map(
  (endpoint) => new RegExp(`^${endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:[A-Za-z]+/g, "[^/]+")}$`)
);

export function isLiveEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === "string" ? args : args.url;
  const method = (typeof args === "string" ? "GET" : (args.method ?? "GET")).toUpperCase();
  const endpoint = `${method} ${url.split("?")[0]}`;
  return LIVE_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint));
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

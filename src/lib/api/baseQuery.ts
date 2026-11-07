import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/lib/env";

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

// Every feature's api slice uses this: credentials (httpOnly session cookie) and the CSRF header.
export const baseQuery: AppBaseQuery = withUnauthorizedEvent(
  fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    prepareHeaders: csrfHeaders,
  }),
);

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)godswheel_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

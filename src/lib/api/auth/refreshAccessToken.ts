import { API_BASE_URL } from "./apiBase";
import { clearSession, setAccessToken, type AccessTokenGrant } from "./accessToken";

export type RefreshOutcome =
  // A new access token is in place.
  | "refreshed"
  // No valid refresh cookie (expired, revoked, or never signed in): the user is signed out.
  | "signed-out"
  // The API couldn't be reached or failed; the session may still be fine, so nothing is cleared.
  | "unavailable";

const LOCK_NAME = "godswheel-auth-refresh";
let inFlight: Promise<RefreshOutcome> | null = null;

// POST /auth/refresh: trades the HttpOnly refresh cookie for a new access token, and the API rotates the cookie.
// Because each refresh replaces the cookie, two refreshes must never race with the same old cookie:
//  - within a tab, callers share one in-flight refresh;
//  - across tabs, the Web Locks API runs them one at a time (where supported), so each uses the newest cookie.
export function refreshAccessToken(): Promise<RefreshOutcome> {
  inFlight ??= runExclusively(doRefresh).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runExclusively(task: () => Promise<RefreshOutcome>): Promise<RefreshOutcome> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? await locks.request(LOCK_NAME, task) : await task();
}

async function doRefresh(): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" });
  } catch {
    return "unavailable";
  }

  if (response.status === 401 || response.status === 403) {
    clearSession();
    return "signed-out";
  }
  if (!response.ok) return "unavailable";

  try {
    const body = (await response.json()) as { data?: AccessTokenGrant };
    if (!body.data?.accessToken) return "unavailable";
    setAccessToken(body.data);
    return "refreshed";
  } catch {
    return "unavailable";
  }
}

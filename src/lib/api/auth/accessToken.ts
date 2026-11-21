// The signed-in session as this tab knows it: the short-lived access token and who it belongs to.
//
// Held in memory only, never in localStorage or a readable cookie, so injected script can't lift it from storage.
// A reload loses it on purpose: the API's HttpOnly refresh cookie (which no script can read) gets a new one
// (see refreshAccessToken.ts).

export interface AccessTokenGrant {
  accessToken: string;
  // ISO time the token stops working.
  expiresAt: string;
}

export interface SessionIdentity {
  id: string;
  fullName: string;
  email: string;
}

// Treat a token as spent this long before it expires, so a request never sets off with one that lapses in flight.
const EXPIRY_MARGIN_MS = 30_000;

let token: { value: string; expiresAt: number } | null = null;
let identity: SessionIdentity | null = null;

export function setAccessToken({ accessToken, expiresAt }: AccessTokenGrant) {
  const expires = Date.parse(expiresAt);
  // An unreadable expiry still gives a usable token; the API's own 401 will say when it's done.
  token = { value: accessToken, expiresAt: Number.isNaN(expires) ? Date.now() + 55 * 60_000 : expires };
  rememberSignedIn(true);
}

// The token, if it's still good for a while; null means "refresh first" (or "not signed in").
export function getAccessToken(): string | null {
  return token && token.expiresAt - EXPIRY_MARGIN_MS > Date.now() ? token.value : null;
}

export const hasAccessToken = () => token !== null;

export const setSessionIdentity = (user: SessionIdentity) => {
  identity = { id: user.id, fullName: user.fullName, email: user.email };
};
export const getSessionIdentity = () => identity;

export function clearSession() {
  token = null;
  identity = null;
  rememberSignedIn(false);
}

// A hint, not a credential: whether this browser was signed in last time, so a guest's page load doesn't make a
// refresh call that can only fail. If it's lost (storage cleared), the user just signs in again.
const SIGNED_IN_HINT_KEY = "godswheel_signed_in";

function rememberSignedIn(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(SIGNED_IN_HINT_KEY, "1");
    else localStorage.removeItem(SIGNED_IN_HINT_KEY);
  } catch {
    // Storage blocked: every load will try a refresh, which is merely one wasted request for guests.
  }
}

export function mayHaveRefreshCookie(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN_HINT_KEY) === "1";
  } catch {
    return true;
  }
}

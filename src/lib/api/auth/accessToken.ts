// The signed-in session on this device: the API's access token and who it belongs to.
//
// The API's tokens don't run out on a timer and there's no refresh: a token lasts until the user signs out
// (POST /auth/logout revokes it) or the API revokes it another way (a password change on another device, or
// "log out everywhere"). So it's kept in localStorage, which survives reloads and closing the browser: people
// stay signed in until they sign out themselves. Page script can read localStorage, which is why the strict
// Content Security Policy in proxy.ts (no inline or third-party script) matters.

export interface SessionIdentity {
  id: string;
  fullName: string;
  email: string;
}

interface StoredSession {
  accessToken: string;
  user: SessionIdentity;
}

// Exported so other tabs can react when it changes (see SessionWatcher).
export const SESSION_STORAGE_KEY = "godswheel_session";
// Left behind by the old refresh-cookie sessions; removed whenever the session is saved or cleared.
const LEGACY_KEYS = ["godswheel_signed_in"];

// Used only when storage is blocked (some private windows): the session then lasts until the tab closes.
let fallback: StoredSession | null = null;

function isStoredSession(value: unknown): value is StoredSession {
  const session = value as StoredSession | null;
  return (
    typeof session?.accessToken === "string" &&
    session.accessToken.length > 0 &&
    typeof session.user?.id === "string" &&
    typeof session.user.fullName === "string" &&
    typeof session.user.email === "string"
  );
}

function readSession(): StoredSession | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return fallback;
  }
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  fallback = session;
  try {
    if (session) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked: the in-memory fallback above still holds it for this tab.
  }
}

const identityOf = (user: SessionIdentity): SessionIdentity => ({ id: user.id, fullName: user.fullName, email: user.email });

// After login or email verification.
export function saveSession(accessToken: string, user: SessionIdentity) {
  writeSession({ accessToken, user: identityOf(user) });
}

export const getAccessToken = (): string | null => readSession()?.accessToken ?? null;

export const getSessionIdentity = (): SessionIdentity | null => readSession()?.user ?? null;

// Keeps the remembered name and email current after GET /auth/me.
export function setSessionIdentity(user: SessionIdentity) {
  const session = readSession();
  if (session) writeSession({ ...session, user: identityOf(user) });
}

// On sign-out, or when the API says the token is no longer valid.
export function clearSession() {
  writeSession(null);
}

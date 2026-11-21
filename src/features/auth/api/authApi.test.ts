// @vitest-environment node
// (jsdom's AbortSignal isn't accepted by Node's Request, which fetchBaseQuery builds; localStorage is stubbed below.)
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken, getSessionIdentity, setAccessToken } from "@/lib/api/auth/accessToken";
import { authApi } from "./authApi";

const inAnHour = () => new Date(Date.now() + 3_600_000).toISOString();
const user = { id: "u-1", fullName: "Tunde Bello Ade", email: "tunde@example.com", emailVerified: true };
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const apiError = (status: number, code: string) => json(status, { success: false, error: { code, message: code, details: null } });

// What each fetch was: method, path and Authorization header (fetchBaseQuery passes a Request; refresh passes url + init).
const describeCall = ([input, init]: [RequestInfo | URL, RequestInit | undefined]) => {
  const request = input instanceof Request ? input : new Request(String(input), init);
  return `${request.method} ${new URL(request.url).pathname} ${request.headers.get("Authorization") ?? "-"}`;
};

const newStore = () =>
  configureStore({
    reducer: { [authApi.reducerPath]: authApi.reducer },
    middleware: (getDefault) => getDefault().concat(authApi.middleware),
  });

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
}

describe("authApi against the live API", () => {
  const fetchSpy = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    clearSession();
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });
  afterEach(() => vi.unstubAllGlobals());
  const calls = () => fetchSpy.mock.calls.map((call) => describeCall(call as never));

  it("signs in: keeps the access token in memory and fills the session from the response", async () => {
    fetchSpy.mockResolvedValueOnce(json(200, { success: true, data: { user, accessToken: "a1", expiresAt: inAnHour(), expiresIn: 3600, tokenType: "Bearer" } }));
    const store = newStore();

    const session = await store.dispatch(authApi.endpoints.signIn.initiate({ email: user.email, password: "long-enough-1" })).unwrap();

    expect(session).toEqual({ userId: "u-1", firstName: "Tunde", lastName: "Bello Ade", email: "tunde@example.com" });
    expect(getAccessToken()).toBe("a1");
    expect(getSessionIdentity()?.id).toBe("u-1");
    expect(calls()).toEqual(["POST /v1/auth/login -"]);
    // Filled straight after the call resolves (onQueryStarted), so every useSession() updates without a refetch.
    await vi.waitFor(() => expect(authApi.endpoints.getSession.select()(store.getState()).data).toEqual(session));
  });

  it("verifying the email spends the token and signs the user in, like login", async () => {
    fetchSpy.mockResolvedValueOnce(json(200, { success: true, data: { user, accessToken: "v1", expiresAt: inAnHour(), expiresIn: 3600, tokenType: "Bearer" } }));
    const store = newStore();

    const session = await store.dispatch(authApi.endpoints.verifyEmail.initiate({ token: "single-use" })).unwrap();

    expect(session.userId).toBe("u-1");
    expect(getAccessToken()).toBe("v1");
    expect(calls()).toEqual(["POST /v1/auth/verify-email -"]);
    const [request] = fetchSpy.mock.calls[0] as [Request];
    expect(await request.clone().json()).toEqual({ token: "single-use" });
    await vi.waitFor(() => expect(authApi.endpoints.getSession.select()(store.getState()).data).toEqual(session));
  });

  it("an expired or used verification link is a 422, with nobody signed in", async () => {
    fetchSpy.mockResolvedValueOnce(apiError(422, "invalid_token"));
    const result = await newStore().dispatch(authApi.endpoints.verifyEmail.initiate({ token: "used" }));
    expect(result).toMatchObject({ error: { status: 422 } });
    expect(getAccessToken()).toBeNull();
    expect(calls()).toEqual(["POST /v1/auth/verify-email -"]);
  });

  it("signing out with a lapsed token refreshes first, so the session is really revoked on the API", async () => {
    setAccessToken({ accessToken: "lapsed", expiresAt: new Date(Date.now() + 5_000).toISOString() });
    fetchSpy
      .mockResolvedValueOnce(json(200, { data: { accessToken: "fresh", expiresAt: inAnHour() } }))
      .mockResolvedValueOnce(json(200, { success: true, data: { message: "Logged out" } }));

    await newStore().dispatch(authApi.endpoints.signOut.initiate()).unwrap();

    expect(calls()).toEqual(["POST /v1/auth/refresh -", "POST /v1/auth/logout Bearer fresh"]);
    expect(getAccessToken()).toBeNull();
  });

  it("forgot password and reset password call the live endpoints with the spec's bodies, no token needed", async () => {
    fetchSpy
      .mockResolvedValueOnce(json(200, { success: true, data: { message: "If an account exists…" } }))
      .mockResolvedValueOnce(json(200, { success: true, data: { message: "Password reset successfully." } }));
    const store = newStore();

    await store.dispatch(authApi.endpoints.requestPasswordReset.initiate({ email: "tunde@example.com" })).unwrap();
    await store.dispatch(authApi.endpoints.resetPassword.initiate({ token: "reset-token", password: "brand-new-pass" })).unwrap();

    expect(calls()).toEqual(["POST /v1/auth/forgot-password -", "POST /v1/auth/reset-password -"]);
    const bodies = await Promise.all(fetchSpy.mock.calls.map(([request]) => (request as Request).clone().json()));
    expect(bodies).toEqual([{ email: "tunde@example.com" }, { token: "reset-token", password: "brand-new-pass" }]);
    // A reset doesn't sign anyone in.
    expect(getAccessToken()).toBeNull();
  });

  it("changes the password with the access token and the spec's snake_case body", async () => {
    setAccessToken({ accessToken: "a1", expiresAt: inAnHour() });
    fetchSpy.mockResolvedValueOnce(json(200, { success: true, data: { message: "Password changed" } }));

    await newStore().dispatch(authApi.endpoints.changePassword.initiate({ currentPassword: "old-pass-1", newPassword: "new-pass-2" })).unwrap();

    expect(calls()).toEqual(["PUT /v1/auth/change-password Bearer a1"]);
    const [request] = fetchSpy.mock.calls[0] as [Request];
    expect(await request.clone().json()).toEqual({ current_password: "old-pass-1", new_password: "new-pass-2" });
    // This session stays signed in.
    expect(getAccessToken()).toBe("a1");
  });

  it("a wrong current password (403) keeps the session: no refresh, no sign-out", async () => {
    setAccessToken({ accessToken: "a1", expiresAt: inAnHour() });
    fetchSpy.mockResolvedValueOnce(apiError(403, "invalid_current_password"));

    const result = await newStore().dispatch(authApi.endpoints.changePassword.initiate({ currentPassword: "nope", newPassword: "new-pass-2" }));

    expect(result).toMatchObject({ error: { status: 403 } });
    expect(calls()).toEqual(["PUT /v1/auth/change-password Bearer a1"]);
    expect(getAccessToken()).toBe("a1");
  });

  it("a wrong password is just an error: no refresh attempt", async () => {
    fetchSpy.mockResolvedValueOnce(apiError(401, "invalid_credentials"));
    const result = await newStore().dispatch(authApi.endpoints.signIn.initiate({ email: user.email, password: "wrong-pass" }));
    expect(result).toMatchObject({ error: { status: 401 } });
    expect(calls()).toEqual(["POST /v1/auth/login -"]);
  });

  it("a guest's page load asks the API nothing", async () => {
    const session = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();
    expect(session).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("after a reload, restores the session from the refresh cookie, then asks who it is", async () => {
    localStorage.setItem("godswheel_signed_in", "1");
    fetchSpy
      .mockResolvedValueOnce(json(200, { success: true, data: { accessToken: "a2", expiresAt: inAnHour(), expiresIn: 3600, tokenType: "Bearer" } }))
      .mockResolvedValueOnce(json(200, { success: true, data: user }));

    const session = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();

    expect(session?.email).toBe("tunde@example.com");
    expect(calls()).toEqual(["POST /v1/auth/refresh -", "GET /v1/auth/me Bearer a2"]);
  });

  it("a refresh cookie that has expired means signed out", async () => {
    localStorage.setItem("godswheel_signed_in", "1");
    fetchSpy.mockResolvedValueOnce(apiError(401, "session_expired"));
    expect(await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap()).toBeNull();
    expect(localStorage.getItem("godswheel_signed_in")).toBeNull();
  });

  it("a 401 on a call with a token gets one refresh and one retry with the new token", async () => {
    setAccessToken({ accessToken: "revoked", expiresAt: inAnHour() });
    fetchSpy
      .mockResolvedValueOnce(apiError(401, "authentication_required"))
      .mockResolvedValueOnce(json(200, { data: { accessToken: "fresh", expiresAt: inAnHour() } }))
      .mockResolvedValueOnce(json(200, { success: true, data: user }));

    const session = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();

    expect(session?.userId).toBe("u-1");
    expect(calls()).toEqual(["GET /v1/auth/me Bearer revoked", "POST /v1/auth/refresh -", "GET /v1/auth/me Bearer fresh"]);
  });

  it("never loops: if the refresh fails too, the user is signed out", async () => {
    setAccessToken({ accessToken: "revoked", expiresAt: inAnHour() });
    fetchSpy.mockResolvedValueOnce(apiError(401, "authentication_required")).mockResolvedValueOnce(apiError(401, "session_expired"));

    expect(await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap()).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
  });

  it("signs out on the API with the token, and forgets the session even if the API can't be reached", async () => {
    setAccessToken({ accessToken: "a3", expiresAt: inAnHour() });
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await newStore().dispatch(authApi.endpoints.signOut.initiate()).unwrap();

    expect(calls()).toEqual(["POST /v1/auth/logout Bearer a3"]);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem("godswheel_signed_in")).toBeNull();
  });
});

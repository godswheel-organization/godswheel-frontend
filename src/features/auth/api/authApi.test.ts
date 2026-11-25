// @vitest-environment node
// (jsdom's AbortSignal isn't accepted by Node's Request, which fetchBaseQuery builds; localStorage is stubbed below.)
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken, getSessionIdentity, saveSession } from "@/lib/api/auth/accessToken";
import { authApi } from "./authApi";

const user = { id: "u-1", fullName: "Tunde Bello Ade", email: "tunde@example.com", emailVerified: true };
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const apiError = (status: number, code: string) => json(status, { success: false, error: { code, message: code, details: null } });

// What each fetch was: method, path and Authorization header.
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
  const session = (accessToken: string) => ({ success: true, data: { user, accessToken, tokenType: "Bearer", issuedAt: "2026-11-25T10:00:00Z" } });

  it("signs in: saves the session on this device and fills it from the response", async () => {
    fetchSpy.mockResolvedValueOnce(json(200, session("a1")));
    const store = newStore();

    const signedIn = await store.dispatch(authApi.endpoints.signIn.initiate({ email: user.email, password: "long-enough-1" })).unwrap();

    expect(signedIn).toEqual({ userId: "u-1", firstName: "Tunde", lastName: "Bello Ade", email: "tunde@example.com" });
    expect(getAccessToken()).toBe("a1");
    expect(getSessionIdentity()?.id).toBe("u-1");
    // Saved where a reload, or closing the browser, won't lose it.
    expect(JSON.parse(localStorage.getItem("godswheel_session") ?? "null")).toMatchObject({ accessToken: "a1", user: { id: "u-1" } });
    expect(calls()).toEqual(["POST /v1/auth/login -"]);
    await vi.waitFor(() => expect(authApi.endpoints.getSession.select()(store.getState()).data).toEqual(signedIn));
  });

  it("verifying the email spends the token and signs the user in, like login", async () => {
    fetchSpy.mockResolvedValueOnce(json(200, session("v1")));
    const store = newStore();

    const signedIn = await store.dispatch(authApi.endpoints.verifyEmail.initiate({ token: "single-use" })).unwrap();

    expect(signedIn.userId).toBe("u-1");
    expect(getAccessToken()).toBe("v1");
    expect(calls()).toEqual(["POST /v1/auth/verify-email -"]);
    const [request] = fetchSpy.mock.calls[0] as [Request];
    expect(await request.clone().json()).toEqual({ token: "single-use" });
    await vi.waitFor(() => expect(authApi.endpoints.getSession.select()(store.getState()).data).toEqual(signedIn));
  });

  it("an expired or used verification link is a 422, with nobody signed in", async () => {
    fetchSpy.mockResolvedValueOnce(apiError(422, "invalid_token"));
    const result = await newStore().dispatch(authApi.endpoints.verifyEmail.initiate({ token: "used" }));
    expect(result).toMatchObject({ error: { status: 422 } });
    expect(getAccessToken()).toBeNull();
    expect(calls()).toEqual(["POST /v1/auth/verify-email -"]);
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
    saveSession("a1", user);
    fetchSpy.mockResolvedValueOnce(json(200, { success: true, data: { message: "Password changed" } }));

    await newStore().dispatch(authApi.endpoints.changePassword.initiate({ currentPassword: "old-pass-1", newPassword: "new-pass-2" })).unwrap();

    expect(calls()).toEqual(["PUT /v1/auth/change-password Bearer a1"]);
    const [request] = fetchSpy.mock.calls[0] as [Request];
    expect(await request.clone().json()).toEqual({ current_password: "old-pass-1", new_password: "new-pass-2" });
    // This session stays signed in.
    expect(getAccessToken()).toBe("a1");
  });

  it("a wrong current password (403) keeps the session", async () => {
    saveSession("a1", user);
    fetchSpy.mockResolvedValueOnce(apiError(403, "invalid_current_password"));

    const result = await newStore().dispatch(authApi.endpoints.changePassword.initiate({ currentPassword: "nope", newPassword: "new-pass-2" }));

    expect(result).toMatchObject({ error: { status: 403 } });
    expect(calls()).toEqual(["PUT /v1/auth/change-password Bearer a1"]);
    expect(getAccessToken()).toBe("a1");
  });

  it("a wrong password is just an error", async () => {
    fetchSpy.mockResolvedValueOnce(apiError(401, "invalid_credentials"));
    const result = await newStore().dispatch(authApi.endpoints.signIn.initiate({ email: user.email, password: "wrong-pass" }));
    expect(result).toMatchObject({ error: { status: 401 } });
    expect(calls()).toEqual(["POST /v1/auth/login -"]);
    expect(getAccessToken()).toBeNull();
  });

  it("a guest's page load asks the API nothing", async () => {
    const guest = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();
    expect(guest).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("after a reload (or reopening the browser), stays signed in with the saved token: one /auth/me, no refresh", async () => {
    saveSession("kept", user);
    fetchSpy.mockResolvedValueOnce(json(200, { success: true, data: { ...user, fullName: "Tunde Bello" } }));

    const restored = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();

    expect(restored).toMatchObject({ userId: "u-1", firstName: "Tunde", lastName: "Bello" });
    expect(calls()).toEqual(["GET /v1/auth/me Bearer kept"]);
    // The remembered name follows the API's.
    expect(getSessionIdentity()?.fullName).toBe("Tunde Bello");
  });

  it("stays signed in when the API can't be reached or has trouble", async () => {
    saveSession("kept", user);
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(apiError(500, "internal_server_error"));

    const offline = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();
    const serverTrouble = await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap();

    expect(offline?.userId).toBe("u-1");
    expect(serverTrouble?.userId).toBe("u-1");
    expect(getAccessToken()).toBe("kept");
  });

  it("ends the session only when the API says the token is no longer valid (401)", async () => {
    saveSession("revoked", user);
    fetchSpy.mockResolvedValueOnce(apiError(401, "authentication_required"));

    expect(await newStore().dispatch(authApi.endpoints.getSession.initiate()).unwrap()).toBeNull();
    expect(calls()).toEqual(["GET /v1/auth/me Bearer revoked"]);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem("godswheel_session")).toBeNull();
  });

  it("signs out on the API with the token, and forgets the session even if the API can't be reached", async () => {
    saveSession("a3", user);
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await newStore().dispatch(authApi.endpoints.signOut.initiate()).unwrap();

    expect(calls()).toEqual(["POST /v1/auth/logout Bearer a3"]);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem("godswheel_session")).toBeNull();
  });
});

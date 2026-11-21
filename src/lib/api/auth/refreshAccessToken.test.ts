import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken, mayHaveRefreshCookie, setAccessToken } from "./accessToken";
import { refreshAccessToken } from "./refreshAccessToken";

const inAnHour = () => new Date(Date.now() + 3_600_000).toISOString();
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("refreshAccessToken", () => {
  const fetchSpy = vi.fn();
  beforeEach(() => {
    clearSession();
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("trades the refresh cookie for a new access token", async () => {
    fetchSpy.mockResolvedValue(json(200, { success: true, data: { accessToken: "new-token", expiresAt: inAnHour(), expiresIn: 3600, tokenType: "Bearer" } }));

    expect(await refreshAccessToken()).toBe("refreshed");
    expect(getAccessToken()).toBe("new-token");
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toMatch(/\/auth\/refresh$/);
    expect(init).toMatchObject({ method: "POST", credentials: "include" });
  });

  it("shares one refresh between callers, since each refresh replaces the cookie", async () => {
    fetchSpy.mockResolvedValue(json(200, { data: { accessToken: "t", expiresAt: inAnHour() } }));
    const outcomes = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);
    expect(outcomes).toEqual(["refreshed", "refreshed", "refreshed"]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("signs out when the refresh session is gone", async () => {
    setAccessToken({ accessToken: "old", expiresAt: inAnHour() });
    fetchSpy.mockResolvedValue(json(401, { success: false, error: { code: "session_expired", message: "", details: null } }));

    expect(await refreshAccessToken()).toBe("signed-out");
    expect(getAccessToken()).toBeNull();
    expect(mayHaveRefreshCookie()).toBe(false);
  });

  it("keeps the session when the API can't be reached (offline isn't signed out)", async () => {
    setAccessToken({ accessToken: "still-good", expiresAt: inAnHour() });
    fetchSpy.mockRejectedValue(new TypeError("Failed to fetch"));

    expect(await refreshAccessToken()).toBe("unavailable");
    expect(getAccessToken()).toBe("still-good");
  });

  it("treats a token near its expiry as spent", () => {
    setAccessToken({ accessToken: "nearly-done", expiresAt: new Date(Date.now() + 10_000).toISOString() });
    expect(getAccessToken()).toBeNull();
  });
});

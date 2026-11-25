// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken, getSessionIdentity, saveSession, setSessionIdentity, SESSION_STORAGE_KEY } from "./accessToken";

const user = { id: "u-1", fullName: "Ada Okafor", email: "ada@example.com" };

function storage(items = new Map<string, string>()): Storage {
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

describe("the saved session", () => {
  beforeEach(() => vi.stubGlobal("localStorage", storage()));
  afterEach(() => {
    clearSession();
    vi.unstubAllGlobals();
  });

  it("is kept until cleared, with no expiry", () => {
    saveSession("token-1", { ...user, emailVerified: true } as typeof user);
    expect(getAccessToken()).toBe("token-1");
    // Only what's needed is stored.
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)!)).toEqual({ accessToken: "token-1", user });
    clearSession();
    expect(getAccessToken()).toBeNull();
    expect(getSessionIdentity()).toBeNull();
  });

  it("keeps the remembered name current, but only for a saved session", () => {
    setSessionIdentity(user);
    expect(getSessionIdentity()).toBeNull();
    saveSession("token-1", user);
    setSessionIdentity({ ...user, fullName: "Ada Okafor-Bello" });
    expect(getSessionIdentity()?.fullName).toBe("Ada Okafor-Bello");
    expect(getAccessToken()).toBe("token-1");
  });

  it("ignores anything unreadable in storage, and tidies up the old refresh-era hint", () => {
    localStorage.setItem(SESSION_STORAGE_KEY, "{not json");
    expect(getAccessToken()).toBeNull();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accessToken: "", user }));
    expect(getAccessToken()).toBeNull();
    localStorage.setItem("godswheel_signed_in", "1");
    saveSession("token-1", user);
    expect(localStorage.getItem("godswheel_signed_in")).toBeNull();
  });

  it("still works for this tab when storage is blocked", () => {
    const blocked = storage();
    blocked.getItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    blocked.setItem = blocked.getItem as never;
    vi.stubGlobal("localStorage", blocked);
    saveSession("token-1", user);
    expect(getAccessToken()).toBe("token-1");
  });
});

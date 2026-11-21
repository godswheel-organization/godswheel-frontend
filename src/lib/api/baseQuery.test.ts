import { describe, expect, it } from "vitest";
import { isLiveEndpoint } from "./baseQuery";

describe("isLiveEndpoint", () => {
  it("sends integrated endpoints to the real API, by method and path", () => {
    expect(isLiveEndpoint({ url: "/auth/signup", method: "POST" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/resend-verification", method: "post" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/login", method: "POST" })).toBe(true);
    expect(isLiveEndpoint("/auth/me")).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/logout", method: "POST" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/verify-email", method: "POST" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/forgot-password", method: "POST" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/reset-password", method: "POST" })).toBe(true);
    expect(isLiveEndpoint({ url: "/auth/change-password", method: "PUT" })).toBe(true);
  });

  it("leaves everything else on the mock", () => {
    expect(isLiveEndpoint("/auth/session")).toBe(false);
    expect(isLiveEndpoint({ url: "/library/sermons", method: "GET" })).toBe(false);
    expect(isLiveEndpoint({ url: "/auth/signup" })).toBe(false); // a GET
  });
});

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

  it("matches :param segments and ignores the query string", () => {
    expect(isLiveEndpoint({ url: "/sermons", params: { page: 2 } })).toBe(true);
    expect(isLiveEndpoint("/sermons?search=faith")).toBe(true);
    expect(isLiveEndpoint("/sermons/fdbd9048-cdfc-30a9-486e-d542d8cfdfc4")).toBe(true);
    expect(isLiveEndpoint({ url: "/sermons/abc/progress", method: "PUT" })).toBe(true);
    expect(isLiveEndpoint({ url: "/sermons/abc/bookmark", method: "DELETE" })).toBe(true);
    expect(isLiveEndpoint("/sermons/abc/comments")).toBe(false);
    expect(isLiveEndpoint({ url: "/sermons/abc", method: "DELETE" })).toBe(false);
    expect(isLiveEndpoint("/history")).toBe(false);
  });

  it("leaves everything else on the mock", () => {
    expect(isLiveEndpoint("/auth/session")).toBe(false);
    expect(isLiveEndpoint({ url: "/library/sermons", method: "GET" })).toBe(false);
    expect(isLiveEndpoint({ url: "/auth/signup" })).toBe(false); // a GET
  });
});

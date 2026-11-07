// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, cookie ? { headers: { cookie } } : undefined);

describe("proxy", () => {
  it("sets a nonce-based content security policy on every page", () => {
    const response = proxy(request("/"));
    const policy = response.headers.get("content-security-policy");

    expect(response.headers.get("location")).toBeNull();
    expect(policy).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(policy).toContain("connect-src 'self' http://localhost:8081");
  });

  it("issues a fresh nonce per request", () => {
    const nonceOf = (response: Response) =>
      response.headers.get("content-security-policy")?.match(/'nonce-([^']+)'/)?.[1];

    expect(nonceOf(proxy(request("/")))).not.toBe(nonceOf(proxy(request("/"))));
  });
});

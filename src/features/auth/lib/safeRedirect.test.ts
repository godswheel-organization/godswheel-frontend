import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safeRedirect";

describe("safeRedirect", () => {
  it("follows same-site paths, query string included", () => {
    expect(safeRedirect("/sermons?topic=faith", "/home")).toBe("/sermons?topic=faith");
  });

  it.each([null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"])(
    "falls back for %s",
    (target) => {
      expect(safeRedirect(target, "/home")).toBe("/home");
    }
  );
});

import { describe, expect, it } from "vitest";
import { parseSearchQuery, toSearchQueryParams } from "./searchQuery";

describe("search query URL", () => {
  it("reads the search and scope", () => {
    expect(parseSearchQuery(new URLSearchParams("q=%20faith%20&in=speaker"))).toEqual({ q: "faith", scope: "speaker" });
  });

  it("defaults to searching everything and drops unknown scopes", () => {
    expect(parseSearchQuery(new URLSearchParams("in=everywhere"))).toEqual({ q: "", scope: "all" });
  });

  it("round-trips, and keeps a fresh search at a bare URL", () => {
    const query = { q: "hebrews", scope: "scripture" } as const;
    expect(parseSearchQuery(toSearchQueryParams(query))).toEqual(query);
    expect(toSearchQueryParams({ q: " ", scope: "all" }).toString()).toBe("");
  });
});

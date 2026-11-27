import { describe, expect, it } from "vitest";
import { hasActiveFilters, parseSermonFilters, toSermonSearchParams } from "./sermonFilters";

describe("parseSermonFilters", () => {
  it("reads every filter from the URL", () => {
    const params = new URLSearchParams("q=faith&category=prayer-worship&speaker=eca605d1-319e-743c-f86c-c3cbda7874eb&book=1+Samuel&sort=oldest");

    expect(parseSermonFilters(params)).toEqual({
      q: "faith",
      category: "prayer-worship",
      speaker: "eca605d1-319e-743c-f86c-c3cbda7874eb",
      book: "1 Samuel",
      sort: "oldest",
    });
  });

  it("sends the old ?topic= links (from before categories came from the API) to the closest category", () => {
    expect(parseSermonFilters(new URLSearchParams("topic=faith")).category).toBe("faith-trust");
    expect(parseSermonFilters(new URLSearchParams("topic=family")).category).toBe("love-relationships");
    expect(parseSermonFilters(new URLSearchParams("topic=astrology")).category).toBeUndefined();
    // ?category= wins when both are there.
    expect(parseSermonFilters(new URLSearchParams("category=holy-spirit&topic=faith")).category).toBe("holy-spirit");
  });

  it("drops malformed categories, speakers and sorts, and blank values", () => {
    expect(parseSermonFilters(new URLSearchParams("category=Not%20A%20Slug!&speaker=Pastor+Daniel&sort=loudest&q=%20%20"))).toEqual({
      q: undefined,
      category: undefined,
      speaker: undefined,
      book: undefined,
      sort: "newest",
    });
  });

  it("sends retired sorts in old links (relevance, shortest) to the default, newest", () => {
    expect(parseSermonFilters(new URLSearchParams("sort=relevance")).sort).toBe("newest");
    expect(parseSermonFilters(new URLSearchParams("sort=shortest")).sort).toBe("newest");
  });
});

describe("toSermonSearchParams", () => {
  it("round-trips through parseSermonFilters", () => {
    const filters = { q: "hope", category: "faith-trust", speaker: "eca605d1-319e-743c-f86c-c3cbda7874eb", book: "Hebrews", sort: "oldest" } as const;

    expect(parseSermonFilters(toSermonSearchParams(filters))).toEqual(filters);
  });

  it("keeps an unfiltered view at a bare URL", () => {
    expect(toSermonSearchParams({ sort: "newest", q: "  " }).toString()).toBe("");
  });
});

describe("hasActiveFilters", () => {
  it("counts category, speaker and book, but not search or sort", () => {
    expect(hasActiveFilters({ sort: "newest", q: "faith" })).toBe(false);
    expect(hasActiveFilters({ sort: "oldest", book: "James" })).toBe(true);
  });
});

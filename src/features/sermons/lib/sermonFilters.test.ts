import { describe, expect, it } from "vitest";
import { hasActiveFilters, parseSermonFilters, toSermonSearchParams } from "./sermonFilters";

describe("parseSermonFilters", () => {
  it("reads every filter from the URL", () => {
    const params = new URLSearchParams("q=faith&topic=prayer&speaker=Pastor+Daniel+Okafor&book=1+Samuel&sort=newest");

    expect(parseSermonFilters(params)).toEqual({
      q: "faith",
      topic: "prayer",
      speaker: "Pastor Daniel Okafor",
      book: "1 Samuel",
      sort: "newest",
    });
  });

  it("drops unknown topics and sorts, and blank values", () => {
    expect(parseSermonFilters(new URLSearchParams("topic=astrology&sort=loudest&q=%20%20"))).toEqual({
      q: undefined,
      topic: undefined,
      speaker: undefined,
      book: undefined,
      sort: "relevance",
    });
  });
});

describe("toSermonSearchParams", () => {
  it("round-trips through parseSermonFilters", () => {
    const filters = { q: "hope", topic: "faith", speaker: "Prophet Grace Mensah", book: "Hebrews", sort: "shortest" } as const;

    expect(parseSermonFilters(toSermonSearchParams(filters))).toEqual(filters);
  });

  it("keeps an unfiltered view at a bare URL", () => {
    expect(toSermonSearchParams({ sort: "relevance", q: "  " }).toString()).toBe("");
  });
});

describe("hasActiveFilters", () => {
  it("counts topic, speaker and book, but not search or sort", () => {
    expect(hasActiveFilters({ sort: "newest", q: "faith" })).toBe(false);
    expect(hasActiveFilters({ sort: "relevance", book: "James" })).toBe(true);
  });
});

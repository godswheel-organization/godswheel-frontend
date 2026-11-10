import { describe, expect, it } from "vitest";
import type { Sermon } from "../types";
import { filterSermons, sermonFilterOptions } from "./filterSermons";
import { testSermon as sermon } from "./testSermon";

const catalogue = [
  sermon({ id: "a", topic: "faith", title: "Living by Faith", preacher: "Pastor Daniel Okafor", scripture: "Hebrews 11:1", durationMinutes: 42, publishedAt: "2026-10-19" }),
  sermon({ id: "b", topic: "faith", title: "The Anchor of Hope", preacher: "Prophet Grace Mensah", scripture: "Hebrews 6:19", durationMinutes: 41, publishedAt: "2026-08-17" }),
  sermon({ id: "c", title: "The Power of Prayer", topic: "prayer", scripture: "James 5:16", durationMinutes: 45, publishedAt: "2026-10-12" }),
  sermon({ id: "d", title: "Faithful in Little", preacher: "Hope Adebayo", scripture: "Luke 16:10", durationMinutes: 30, publishedAt: "2026-09-01" }),
];

const ids = (list: Sermon[]) => list.map((item) => item.id);

describe("filterSermons", () => {
  it("returns everything in catalogue order with no filters", () => {
    expect(ids(filterSermons(catalogue, { sort: "relevance" }))).toEqual(["a", "b", "c", "d"]);
  });

  it("combines topic, speaker and book filters", () => {
    expect(ids(filterSermons(catalogue, { sort: "relevance", topic: "faith", book: "Hebrews" }))).toEqual(["a", "b"]);
    expect(ids(filterSermons(catalogue, { sort: "relevance", book: "Hebrews", speaker: "Prophet Grace Mensah" }))).toEqual(["b"]);
  });

  it("searches case-insensitively and ranks title matches above speaker matches", () => {
    // "hope" is in b's title and d's preacher's name. With d listed first, the title match still ranks first.
    const [, b, , d] = catalogue;
    expect(ids(filterSermons([d, b], { sort: "relevance", q: "  HOPE " }))).toEqual(["b", "d"]);
  });

  it("matches scripture references", () => {
    expect(ids(filterSermons(catalogue, { sort: "relevance", q: "james 5" }))).toEqual(["c"]);
  });

  it("sorts by newest and by shortest", () => {
    expect(ids(filterSermons(catalogue, { sort: "newest" }))).toEqual(["a", "c", "d", "b"]);
    expect(ids(filterSermons(catalogue, { sort: "shortest" }))).toEqual(["d", "b", "a", "c"]);
  });
});

describe("sermonFilterOptions", () => {
  it("lists each speaker and book once, alphabetically", () => {
    expect(sermonFilterOptions(catalogue)).toEqual({
      speakers: ["Hope Adebayo", "Pastor Daniel Okafor", "Pastor Ruth Bamidele", "Prophet Grace Mensah"],
      books: ["Hebrews", "James", "Luke"],
    });
  });
});

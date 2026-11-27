import { describe, expect, it } from "vitest";
import { isApiId, sermonListParams, speakersMatching, toSermon, type ApiSermon } from "./apiSermon";

const SUMMARY = {
  id: "fdbd9048-cdfc-30a9-486e-d542d8cfdfc4",
  title: "Jesus' View of Adultery",
  slug: "jesus-view-of-adultery",
  speaker: { id: "eca605d1-319e-743c-f86c-c3cbda7874eb", name: "R.C. Sproul" },
  categories: [{ id: "b8d29db7-15ca-0499-3204-bd05ebfa3dd8", name: "Love & Relationships", slug: "love-relationships" }],
  durationSeconds: 1989,
  publishedAt: "2026-11-23T09:45:30.930880Z",
  thumbnailUrl: null,
};

describe("toSermon", () => {
  it("reads a list item, leaving out what only the full record has", () => {
    expect(toSermon(SUMMARY)).toEqual({
      id: SUMMARY.id,
      title: "Jesus' View of Adultery",
      preacher: "R.C. Sproul",
      speakerId: "eca605d1-319e-743c-f86c-c3cbda7874eb",
      categories: SUMMARY.categories,
      publishedAt: "2026-11-23T09:45:30.930880Z",
      durationSeconds: 1989,
    });
  });

  it("reads the full record: passages, language, description and audio", () => {
    const full: ApiSermon = {
      ...SUMMARY,
      categories: [{ ...SUMMARY.categories[0], description: "Biblical teaching about love." } as never],
      description: "A sermon on Matthew 5.",
      language: "English",
      audioUrl: "https://example.com/a.mp3",
      scriptures: [
        { reference: "Matthew 5:27-30", book: "Matthew", chapter: 5, startVerse: 27, endVerse: 30 },
        { reference: null, book: "Romans", chapter: 8, startVerse: 28, endVerse: 28 },
        { book: "Psalm", chapter: 23 },
      ],
    };
    expect(toSermon(full)).toMatchObject({
      scripture: "Matthew 5:27-30",
      scriptureRefs: ["Romans 8:28", "Psalm 23"],
      language: "English",
      description: "A sermon on Matthew 5.",
      audioUrl: "https://example.com/a.mp3",
      // Category descriptions are dropped: no sermon view shows them.
      categories: SUMMARY.categories,
    });
  });

  it("copes with missing or empty values", () => {
    const sermon = toSermon({ ...SUMMARY, speaker: null, categories: null, durationSeconds: null, publishedAt: "" });
    expect(sermon.preacher).toBe("Unknown speaker");
    expect(sermon.categories).toEqual([]);
    expect(sermon).not.toHaveProperty("durationSeconds");
    expect(sermon).not.toHaveProperty("publishedAt");
  });
});

describe("isApiId", () => {
  it("tells the API's UUIDs from the mock's slugs", () => {
    expect(isApiId(SUMMARY.id)).toBe(true);
    expect(isApiId("arise-and-shine")).toBe(false);
    expect(isApiId(undefined)).toBe(false);
  });
});

describe("sermonListParams", () => {
  const categories = [{ id: "a017e80b-34ad-f3e0-e481-51eee3e86ccf", slug: "faith-trust" }];

  it("turns Browse's filters into GET /sermons's query", () => {
    expect(
      sermonListParams({ q: " hope ", category: "faith-trust", speaker: SUMMARY.speaker.id, book: "Psalms", sort: "oldest" }, categories)
    ).toEqual({
      sort: "oldest",
      search: "hope",
      category_id: "a017e80b-34ad-f3e0-e481-51eee3e86ccf",
      speaker_id: SUMMARY.speaker.id,
      // The API's sermons cite "Psalm 23".
      scripture: "Psalm",
    });
    expect(sermonListParams({ sort: "newest" }, [])).toEqual({ sort: "newest" });
  });

  it("gives null for a category that isn't one, so nothing is asked of the API", () => {
    expect(sermonListParams({ category: "astrology", sort: "newest" }, categories)).toBeNull();
  });
});

describe("speakersMatching", () => {
  const speakers = [
    { id: "1", name: "Dr Allan Brown" },
    { id: "2", name: "R.C. Sproul" },
  ];

  it("matches every word typed, in any case", () => {
    expect(speakersMatching(speakers, "allan").map((speaker) => speaker.id)).toEqual(["1"]);
    expect(speakersMatching(speakers, "BROWN dr").map((speaker) => speaker.id)).toEqual(["1"]);
    expect(speakersMatching(speakers, "allan sproul")).toEqual([]);
    expect(speakersMatching(speakers, "  ")).toEqual([]);
  });
});

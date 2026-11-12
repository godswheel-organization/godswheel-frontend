import { describe, expect, it } from "vitest";
import { chapterOf, fullChapterUrl } from "./chapter";

describe("chapterOf", () => {
  it.each([
    ["Isaiah 60:1", "Isaiah 60"],
    ["1 Samuel 3:9-10", "1 Samuel 3"],
    ["Psalm 23", "Psalm 23"],
    ["Jude", "Jude"],
  ])("%s → %s", (reference, chapter) => {
    expect(chapterOf(reference)).toBe(chapter);
  });
});

describe("fullChapterUrl", () => {
  it("links to the chapter in the chosen version", () => {
    expect(fullChapterUrl("1 Samuel 3:10", "KJV")).toBe("https://www.biblegateway.com/passage/?search=1+Samuel+3&version=KJV");
  });
});

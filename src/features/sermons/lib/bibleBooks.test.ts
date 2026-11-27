import { describe, expect, it } from "vitest";
import { apiBookName, apiScripture, BIBLE_BOOKS, isScriptureSearch } from "./bibleBooks";

describe("Bible books", () => {
  it("lists all 66", () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
    expect(new Set(BIBLE_BOOKS).size).toBe(66);
  });

  it("names Psalms the way the API's sermons cite it", () => {
    expect(apiBookName("Psalms")).toBe("Psalm");
    expect(apiBookName("Romans")).toBe("Romans");
    expect(apiScripture("psalms 23")).toBe("Psalm 23");
    expect(apiScripture(" John 3:16 ")).toBe("John 3:16");
  });

  it("recognises searches that look like passages", () => {
    for (const query of ["romans", "Romans 8", "John 3:16", "Matthew 5:3-12", "1 John", "song of solomon 2", "Psalm 23"]) {
      expect(isScriptureSearch(query)).toBe(true);
    }
    for (const query of ["grace", "faith in god", "R.C. Sproul", "3:16", ""]) {
      expect(isScriptureSearch(query)).toBe(false);
    }
  });
});

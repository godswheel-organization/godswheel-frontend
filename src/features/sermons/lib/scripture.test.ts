import { describe, expect, it } from "vitest";
import { scriptureBook } from "./scripture";

describe("scriptureBook", () => {
  it.each([
    ["Hebrews 11:1", "Hebrews"],
    ["1 Samuel 3:10", "1 Samuel"],
    ["Psalm 30:5-7", "Psalm"],
    ["Song of Songs 2:4", "Song of Songs"],
    ["Psalm 23", "Psalm"],
    ["Jude", "Jude"],
  ])("reads the book from %s", (reference, book) => {
    expect(scriptureBook(reference)).toBe(book);
  });
});

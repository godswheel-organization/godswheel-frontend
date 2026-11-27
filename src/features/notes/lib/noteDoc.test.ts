import { describe, expect, it } from "vitest";
import { docFromText, docOf } from "./noteDoc";
import { editorContentFor } from "./noteEditorExtensions";

describe("note docs", () => {
  it("builds a doc from a plain-text note, a paragraph per line", () => {
    expect(docFromText("First\n\nSecond")).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "First" }] },
        { type: "paragraph", content: [{ type: "text", text: "Second" }] },
      ],
    });
    expect(docOf(null)).toBeUndefined();
    expect(docOf({ id: "n", sermonId: "s", text: "Old note", createdAt: "" })?.content).toHaveLength(1);
  });

  it("falls back to the plain text when the editor can't read a stored doc", () => {
    const good = docFromText("Fine");
    expect(editorContentFor(good, "Fine")).toBe(good);
    const unknown = { type: "doc" as const, content: [{ type: "table", content: [] }] };
    expect(editorContentFor(unknown, "Kept text")).toEqual(docFromText("Kept text"));
  });
});

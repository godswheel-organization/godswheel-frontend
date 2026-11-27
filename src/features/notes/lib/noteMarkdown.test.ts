import { getSchema } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { describe, expect, it } from "vitest";
import type { NoteDoc } from "../types";
import { noteEditorExtensions } from "./noteEditorExtensions";
import { markdownToNoteDoc, noteDocToMarkdown, noteDocToText } from "./noteMarkdown";

const text = (value: string, ...marks: string[]) =>
  marks.length ? { type: "text", text: value, marks: marks.map((type) => ({ type })) } : { type: "text", text: value };
const p = (...content: object[]) => ({ type: "paragraph", content });
const doc = (...content: object[]) => ({ type: "doc", content }) as NoteDoc;

// What the editor would make: headings, a quote, nested lists, marks and a line break.
const FULL = doc(
  { type: "heading", attrs: { level: 2 }, content: [text("Morning prayer")] },
  p(text("Make "), text("room", "bold"), text(" for the "), text("Word", "italic"), text(" — "), text("daily", "bold", "italic")),
  { type: "heading", attrs: { level: 3 }, content: [text("Notes")] },
  { type: "blockquote", content: [p(text("Arise, shine; for thy light is come."))] },
  {
    type: "bulletList",
    content: [
      { type: "listItem", content: [p(text("Pray first"))] },
      {
        type: "listItem",
        content: [p(text("Read")), { type: "orderedList", attrs: { start: 1 }, content: [{ type: "listItem", content: [p(text("Psalm 23"))] }] }],
      },
    ],
  },
  p(text("Line one"), { type: "hardBreak" }, text("Line two"))
);

describe("note Markdown", () => {
  it("writes the editor's formatting as Markdown", () => {
    expect(noteDocToMarkdown(FULL)).toBe(
      [
        "## Morning prayer",
        "",
        "Make **room** for the *Word* — ***daily***",
        "",
        "### Notes",
        "",
        "> Arise, shine; for thy light is come.",
        "",
        "- Pray first",
        "- Read",
        "  1. Psalm 23",
        "",
        "Line one\\",
        "Line two",
      ].join("\n")
    );
  });

  it("reads it back into the same document", () => {
    expect(markdownToNoteDoc(noteDocToMarkdown(FULL))).toEqual(FULL);
  });

  it("produces documents the editor accepts", () => {
    const schema = getSchema(noteEditorExtensions);
    for (const markdown of [noteDocToMarkdown(FULL), "", "> ", "- ", "1. a\n2. b\n\n- c", "**unclosed", "# H1\n#### H4"]) {
      expect(() => Node.fromJSON(schema, markdownToNoteDoc(markdown)).check()).not.toThrow();
    }
  });

  it("keeps characters that look like formatting as typed", () => {
    const literal = doc(p(text("2 * 3 * 4 = 24, snake_case, \\o/")), p(text("# not a heading")), p(text("- not a list")), p(text("1. not a list")));
    const markdown = noteDocToMarkdown(literal);
    expect(markdown).toContain("\\# not a heading");
    expect(markdownToNoteDoc(markdown)).toEqual(literal);
  });

  it("moves spaces outside bold and italic, where Markdown needs them", () => {
    expect(noteDocToMarkdown(doc(p(text("a"), text(" bold ", "bold"), text("b"))))).toBe("a **bold** b");
  });

  it("reads plain text and Markdown written elsewhere", () => {
    expect(markdownToNoteDoc("Just a thought.\nSame paragraph.\n\nNew one.")).toEqual(
      doc(p(text("Just a thought. Same paragraph.")), p(text("New one.")))
    );
    expect(markdownToNoteDoc("* one\n* two\n\n3. three\n4. four")).toEqual(
      doc(
        { type: "bulletList", content: [{ type: "listItem", content: [p(text("one"))] }, { type: "listItem", content: [p(text("two"))] }] },
        { type: "orderedList", attrs: { start: 3 }, content: [{ type: "listItem", content: [p(text("three"))] }, { type: "listItem", content: [p(text("four"))] }] }
      )
    );
    expect(markdownToNoteDoc("_grace_ and __x")).toEqual(doc(p(text("grace", "italic"), text(" and __x"))));
  });

  it("gives the plain text, one line per block", () => {
    expect(noteDocToText(FULL)).toBe(
      "Morning prayer\nMake room for the Word — daily\nNotes\nArise, shine; for thy light is come.\nPray first\nRead\nPsalm 23\nLine one\nLine two"
    );
  });
});

import { getSchema, type JSONContent } from "@tiptap/core";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Node } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import type { NoteDoc } from "../types";
import { docFromText, NOTE_MAX_LENGTH } from "./noteDoc";

// What a note can hold, as on Medium: paragraphs, a heading and subheading, quotes, lists, bold and italic.
// Markdown-style shortcuts come with it: "## " heading, "### " subheading, "> " quote, "- " or "1. " list,
// **bold**, *italic*. Links, code and the rest are left out: a note isn't a document.
export const noteEditorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
    underline: false,
  }),
  Placeholder.configure({ placeholder: "Write your thoughts…" }),
  CharacterCount.configure({ limit: NOTE_MAX_LENGTH, mode: "textSize" }),
];

// A stored doc the editor can't read (e.g. from a newer app version) falls back to its plain text,
// rather than throwing when the sheet opens.
export function editorContentFor(doc: NoteDoc, text: string): JSONContent {
  try {
    Node.fromJSON(getSchema(noteEditorExtensions), doc).check();
    return doc;
  } catch {
    return docFromText(text);
  }
}

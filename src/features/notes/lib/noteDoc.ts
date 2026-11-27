import type { NoteDoc, SermonNote } from "../types";

// Counted on the note's plain text (formatting is free).
export const NOTE_MAX_LENGTH = 5000;

// A note written before formatting existed: one paragraph per line.
export function docFromText(text: string): NoteDoc {
  const lines = text.split(/\n+/).filter((line) => line.trim());
  return {
    type: "doc",
    content: lines.length
      ? lines.map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] }))
      : [{ type: "paragraph" }],
  };
}

export const docOf = (note: SermonNote | null | undefined): NoteDoc | undefined =>
  note ? (note.doc ?? docFromText(note.text)) : undefined;

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

// What the API checks before storing a doc: the right shape and a sane size.
export function isNoteDoc(value: unknown): value is NoteDoc {
  if (!value || typeof value !== "object" || (value as { type?: unknown }).type !== "doc") return false;
  const content = (value as { content?: unknown }).content;
  if (content !== undefined && !Array.isArray(content)) return false;
  return JSON.stringify(value).length <= NOTE_MAX_LENGTH * 20;
}

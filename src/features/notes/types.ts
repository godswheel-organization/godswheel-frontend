// A note's formatted body, stored as the editor's JSON document (ProseMirror/Tiptap shape):
// paragraphs, headings, quotes and lists, with bold/italic marks. Never HTML, so there's nothing to sanitise.
export type NoteDocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: NoteDocNode[];
  text?: string;
};
export type NoteDoc = NoteDocNode & { type: "doc" };

// One note per sermon, per listener (GET /sermons/{id}/note). The API stores the body as Markdown.
export interface SermonNote {
  id: string;
  sermonId: string;
  // The note as plain text: for previews and copying.
  text: string;
  // The formatted note. Missing on notes written before formatting existed: those are built from `text`.
  doc?: NoteDoc;
  // ISO timestamps.
  createdAt: string;
  updatedAt?: string;
}

export interface SaveNoteRequest {
  sermonId: string;
  text: string;
  doc: NoteDoc;
}

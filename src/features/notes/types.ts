// TODO(backend): replace with the real notes contract once the Godswheel API spec is available.

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

// One note per sermon, per listener.
export interface SermonNote {
  id: string;
  sermonId: string;
  // The moment in the sermon the note was first written at, in seconds. Editing keeps it.
  atSeconds: number;
  // The note as plain text: for previews, search and the data export.
  text: string;
  // The formatted note. Missing on notes written before formatting existed: those are built from `text`.
  doc?: NoteDoc;
  // ISO timestamps.
  createdAt: string;
  updatedAt?: string;
}

export interface SaveNoteRequest {
  sermonId: string;
  atSeconds: number;
  text: string;
  doc: NoteDoc;
}

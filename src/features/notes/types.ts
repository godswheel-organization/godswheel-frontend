// TODO(backend): replace with the real notes contract once the Godswheel API spec is available.

// One note per sermon, per listener.
export interface SermonNote {
  id: string;
  sermonId: string;
  // The moment in the sermon the note was first written at, in seconds. Editing keeps it.
  atSeconds: number;
  text: string;
  // ISO timestamps.
  createdAt: string;
  updatedAt?: string;
}

export interface SaveNoteRequest {
  sermonId: string;
  atSeconds: number;
  text: string;
}

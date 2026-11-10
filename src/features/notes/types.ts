// TODO(backend): replace with the real notes contract once the Godswheel API spec is available.
export interface SermonNote {
  id: string;
  sermonId: string;
  // The moment in the sermon the note was taken at, in seconds.
  atSeconds: number;
  text: string;
  // ISO timestamp.
  createdAt: string;
}

export interface AddNoteRequest {
  sermonId: string;
  atSeconds: number;
  text: string;
}

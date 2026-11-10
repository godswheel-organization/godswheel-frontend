// TODO(backend): replace with the real Bible contract once the Godswheel API spec is available.
export interface BibleVersion {
  // e.g. "KJV"
  id: string;
  // e.g. "King James Version (KJV)"
  name: string;
}

export interface BiblePassage {
  // e.g. "Isaiah 60:1"
  reference: string;
  version: string;
  text: string;
}

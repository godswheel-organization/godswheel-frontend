import type { Sermon } from "@/features/sermons/types";

// TODO(backend): replace with the real library/history contract once the Godswheel API spec is available.

export interface SavedSermon {
  sermon: Sermon;
  // ISO timestamp.
  savedAt: string;
}

export interface HistoryEntry {
  sermon: Sermon;
  // How far in the listener got, in seconds.
  positionSeconds: number;
  // ISO timestamp of the last time it played.
  playedAt: string;
  finished: boolean;
}

export interface RecordProgressRequest {
  sermonId: string;
  positionSeconds: number;
}

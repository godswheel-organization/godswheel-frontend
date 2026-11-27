import type { Sermon } from "@/features/sermons/types";

// A bookmarked sermon (GET /sermon-bookmarks).
export interface SavedSermon {
  sermon: Sermon;
  // When it was saved (ISO). The API doesn't say, so only a save made in this session has it.
  savedAt?: string;
}

// Listening history. The API keeps each sermon's position (GET/PUT /sermons/{id}/progress) but has no list of
// them, so the list (Recently played, Continue listening) is still kept by the mock, on this device.
export interface HistoryEntry {
  sermon: Sermon;
  // How far in the listener got, in seconds.
  positionSeconds: number;
  // ISO timestamp of the last time it played.
  playedAt: string;
  finished: boolean;
}

// GET /sermons/{id}/progress: where the listener got to, on any device.
export interface SermonProgress {
  sermonId: string;
  positionSeconds: number;
  updatedAt: string;
}

export interface RecordProgressRequest {
  sermonId: string;
  positionSeconds: number;
}

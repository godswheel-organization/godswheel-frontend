import type { UserSettings } from "@/features/settings/types";
import type { SermonNote } from "@/features/notes/types";
import type { MockStore } from "./store";

// What the mock backend keeps, and the keys it keeps it under. Sermons themselves come from the
// catalogue (features/sermons/mocks), so per-user records only hold sermon ids.

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  // Lower-cased, so sign-in is case-insensitive.
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface StoredSaved {
  sermonId: string;
  savedAt: string;
}

export interface StoredHistory {
  sermonId: string;
  positionSeconds: number;
  playedAt: string;
  finished: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = { allowAnalytics: false };

const keys = {
  users: "users",
  session: "session",
  saved: (userId: string) => `saved:${userId}`,
  history: (userId: string) => `history:${userId}`,
  notes: (userId: string) => `notes:${userId}`,
  settings: (userId: string) => `settings:${userId}`,
};

// Typed reads and writes over the raw store.
export function records(store: MockStore) {
  return {
    users: {
      all: async () => (await store.get<StoredUser[]>(keys.users)) ?? [],
      save: (users: StoredUser[]) => store.set(keys.users, users),
    },
    session: {
      userId: async () => (await store.get<{ userId: string }>(keys.session))?.userId ?? null,
      start: (userId: string) => store.set(keys.session, { userId }),
      end: () => store.delete(keys.session),
    },
    saved: {
      list: async (userId: string) => (await store.get<StoredSaved[]>(keys.saved(userId))) ?? [],
      save: (userId: string, items: StoredSaved[]) => store.set(keys.saved(userId), items),
    },
    history: {
      list: async (userId: string) => (await store.get<StoredHistory[]>(keys.history(userId))) ?? [],
      save: (userId: string, items: StoredHistory[]) => store.set(keys.history(userId), items),
    },
    notes: {
      list: async (userId: string) => (await store.get<SermonNote[]>(keys.notes(userId))) ?? [],
      save: (userId: string, items: SermonNote[]) => store.set(keys.notes(userId), items),
    },
    settings: {
      get: async (userId: string) => (await store.get<UserSettings>(keys.settings(userId))) ?? DEFAULT_SETTINGS,
      save: (userId: string, settings: UserSettings) => store.set(keys.settings(userId), settings),
    },
  };
}

export type MockRecords = ReturnType<typeof records>;

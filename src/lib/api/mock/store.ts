import { openDB } from "idb";

// The mock backend's storage: a tiny key-value interface, so the same handlers run on IndexedDB in the
// browser and on a Map in tests.
export interface MockStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

// Kept apart from the app's own "godswheel" database (offline drafts), so it can be wiped on its own.
export const MOCK_DB_NAME = "godswheel-mock-api";

export function createIdbStore(): MockStore {
  const db = openDB(MOCK_DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore("kv");
    },
  });
  return {
    async get<T>(key: string) {
      return (await (await db).get("kv", key)) as T | undefined;
    },
    async set<T>(key: string, value: T) {
      await (await db).put("kv", value, key);
    },
    async delete(key: string) {
      await (await db).delete("kv", key);
    },
  };
}

export function createMemoryStore(): MockStore {
  const map = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return map.get(key) as T | undefined;
    },
    async set<T>(key: string, value: T) {
      map.set(key, value);
    },
    async delete(key: string) {
      map.delete(key);
    },
  };
}

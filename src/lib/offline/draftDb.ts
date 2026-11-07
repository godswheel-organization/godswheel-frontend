import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { encryptForStorage, decryptFromStorage } from "@/lib/security/crypto";

// Encrypted draft persistence — the only code path allowed to write user data to IndexedDB.
// A draft id names one unit of offline work (e.g. "profile", "order:123"); features choose their own ids.

export type DraftId = string;

interface GodswheelDraftDB extends DBSchema {
  drafts: {
    key: DraftId;
    value: {
      id: DraftId;
      ciphertext: ArrayBuffer;
      iv: Uint8Array;
      updatedAt: number;
      // 0/1 rather than a boolean, since IDB indexes don't support booleans.
      synced: 0 | 1;
    };
    indexes: { "by-synced": number };
  };
}

let dbPromise: Promise<IDBPDatabase<GodswheelDraftDB>> | null = null;

function getDb() {
  dbPromise ??= openDB<GodswheelDraftDB>("godswheel", 1, {
    upgrade(db) {
      const store = db.createObjectStore("drafts", { keyPath: "id" });
      store.createIndex("by-synced", "synced");
    },
  });
  return dbPromise;
}

export async function saveDraftLocally(id: DraftId, data: unknown): Promise<void> {
  const { ciphertext, iv } = await encryptForStorage(data);
  const db = await getDb();
  await db.put("drafts", { id, ciphertext, iv, updatedAt: Date.now(), synced: 0 });
}

export async function readDraftLocally<T>(id: DraftId): Promise<T | null> {
  const db = await getDb();
  const record = await db.get("drafts", id);
  if (!record) return null;
  return decryptFromStorage<T>({ ciphertext: record.ciphertext, iv: record.iv });
}

export async function getUnsyncedDraftIds(): Promise<DraftId[]> {
  const db = await getDb();
  return db.getAllKeysFromIndex("drafts", "by-synced", 0);
}

export async function markDraftSynced(id: DraftId): Promise<void> {
  const db = await getDb();
  const record = await db.get("drafts", id);
  if (record) {
    await db.put("drafts", { ...record, synced: 1 });
  }
}

// Sign-out: drafts belong to the signed-in user and must not outlive their session.
export async function clearDraftsLocally(): Promise<void> {
  const db = await getDb();
  await db.clear("drafts");
}

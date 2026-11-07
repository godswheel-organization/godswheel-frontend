import { getUnsyncedDraftIds, readDraftLocally, markDraftSynced, type DraftId } from "./draftDb";

type SaveDraftFn = (id: DraftId, data: unknown) => Promise<void>;

// Foreground-only reconnect sync (triggered by useOnlineSync), not Background Sync API — a service worker can't reach the sessionStorage-held key.
export async function flushUnsyncedDrafts(saveDraft: SaveDraftFn): Promise<void> {
  const unsyncedIds = await getUnsyncedDraftIds();

  for (const id of unsyncedIds) {
    try {
      const data = await readDraftLocally(id);
      if (data === null) continue;

      await saveDraft(id, data);
      await markDraftSynced(id);
    } catch {
      // Left unsynced — retried on the next 'online' event or manual save.
    }
  }
}

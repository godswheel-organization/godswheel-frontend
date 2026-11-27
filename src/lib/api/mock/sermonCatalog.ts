import { isApiId, toSermon, type ApiSermon } from "@/features/sermons/lib/apiSermon";
import { sermons } from "@/features/sermons/mocks/sermons";
import type { Sermon } from "@/features/sermons/types";
import { API_BASE_URL } from "../auth/apiBase";

// The sermons the mocked endpoints (library, history, notes, reports) know about: the mock catalogue's, and any
// real one, looked up with the live GET /sermons/{id}. So a sermon found in Browse (the live API) can be saved,
// played into history and noted while those endpoints are still mocked. Each lookup is kept for the session.
const live = new Map<string, Promise<Sermon | undefined>>();

async function fetchLive(id: string): Promise<Sermon | undefined> {
  const response = await fetch(`${API_BASE_URL}/sermons/${encodeURIComponent(id)}`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GET /sermons/${id} answered ${response.status}`);
  return toSermon(((await response.json()) as { data: ApiSermon }).data);
}

export async function findSermon(id: string): Promise<Sermon | undefined> {
  const mock = sermons.find((sermon) => sermon.id === id);
  if (mock || !isApiId(id)) return mock;
  let lookup = live.get(id);
  if (!lookup) {
    // A failed lookup (offline, API down) isn't remembered, so the next call tries again.
    lookup = fetchLive(id).catch(() => {
      live.delete(id);
      return undefined;
    });
    live.set(id, lookup);
  }
  return lookup;
}

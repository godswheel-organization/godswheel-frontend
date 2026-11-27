import { cache } from "react";
import { env } from "@/lib/env";
import { isApiId, toSermon, type ApiPage, type ApiSermon, type ApiSermonSummary } from "../lib/apiSermon";
import { sermons as mockSermons } from "../mocks/sermons";
import type { Sermon } from "../types";
import { apiGet, apiGetAll, ApiStatusError, remembered } from "./apiFetch";

// Server-side reads of the sermon catalogue (GET /sermons, GET /sermons/{id}).

// One sermon's full record, for its page (and its metadata and share image). cache() shares one lookup per request.
// null when there's no such sermon. The mock catalogue's sermons (slug ids like "arise-and-shine", still in
// saved lists and history while those are mocked) are found there while the mock is on.
export const getSermon = cache(async (id: string): Promise<Sermon | null> => {
  if (!isApiId(id)) {
    return env.NEXT_PUBLIC_USE_MOCK_API ? (mockSermons.find((sermon) => sermon.id === id) ?? null) : null;
  }
  try {
    const { data } = await apiGet<{ data: ApiSermon }>(`/sermons/${encodeURIComponent(id)}`, { timeoutMs: 5000 });
    return toSermon(data);
  } catch (error) {
    // Not found (or not an id the API accepts): a 404 page. Anything else (API down, too slow) is a real error,
    // which the error page reports with a retry, rather than telling people the sermon doesn't exist.
    if (error instanceof ApiStatusError && (error.status === 404 || error.status === 400 || error.status === 422)) return null;
    throw error;
  }
});

// The newest sermons, for the landing page and Home. Kept for five minutes.
const LATEST_COUNT = 8;
const latest = remembered(
  async () =>
    (await apiGet<ApiPage<ApiSermonSummary>>(`/sermons?sort=newest&page=1&limit=${LATEST_COUNT}`)).data.map(toSermon),
  { ttlMs: 5 * 60 * 1000, fallback: [] as Sermon[] }
);

export async function getLatestSermons(count: number): Promise<Sermon[]> {
  return (await latest()).slice(0, count);
}

// Every published sermon, for the sitemap. Kept for an hour.
export const getAllSermons = remembered(async () => (await apiGetAll<ApiSermonSummary>("/sermons?sort=newest")).map(toSermon), {
  ttlMs: 60 * 60 * 1000,
  fallback: [] as Sermon[],
});

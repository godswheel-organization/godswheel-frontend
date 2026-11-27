import { env } from "@/lib/env";
import type { ApiPage } from "../lib/apiSermon";

// Server-side reads of the GodsWheel API, for pages rendered on the server (a Server Component can't use RTK Query).
//
// Every page here renders per request (force-dynamic, for the CSP nonce), which also turns off Next's fetch cache.
// So lists are kept in this server instance's memory instead (see remembered()), and a slow API never holds a
// page up for long: each request gives up after a few seconds.

const TIMEOUT_MS = 2500;
const PAGE_LIMIT = 100;
const MAX_PAGES = 10;

export class ApiStatusError extends Error {
  constructor(
    readonly path: string,
    readonly status: number
  ) {
    super(`GET ${path} answered ${status}`);
  }
}

export async function apiGet<T>(path: string, { timeoutMs = TIMEOUT_MS } = {}): Promise<T> {
  const base = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!response.ok) throw new ApiStatusError(path, response.status);
  return (await response.json()) as T;
}

// Every item of a paged list (at most MAX_PAGES pages of 100).
export async function apiGetAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  const separator = path.includes("?") ? "&" : "?";
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await apiGet<ApiPage<T>>(`${path}${separator}page=${page}&limit=${PAGE_LIMIT}`);
    items.push(...body.data);
    if (!body.meta?.hasNextPage) break;
  }
  return items;
}

// load(), kept for ttlMs and shared by requests that arrive while it runs. If it fails, the last good value is
// used, or `fallback` when there's never been one (and the next request tries again).
export function remembered<T>(load: () => Promise<T>, { ttlMs, fallback }: { ttlMs: number; fallback: T }): () => Promise<T> {
  let cached: { value: T; at: number } | null = null;
  let inFlight: Promise<T> | null = null;
  return () => {
    if (cached && Date.now() - cached.at < ttlMs) return Promise.resolve(cached.value);
    inFlight ??= load()
      .then((value) => {
        cached = { value, at: Date.now() };
        return value;
      })
      .catch(() => cached?.value ?? fallback)
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };
}

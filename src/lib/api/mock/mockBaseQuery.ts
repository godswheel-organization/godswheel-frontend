import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { records } from "./records";
import { handleMockRequest } from "./router";
import { seedIfEmpty } from "./seed";
import { createIdbStore, createMemoryStore, type MockStore } from "./store";

// Long enough to see loading states and catch double-submits; short enough not to annoy.
const MOCK_LATENCY_MS = 250;

let storePromise: Promise<MockStore> | null = null;

function getStore(): Promise<MockStore> {
  storePromise ??= (async () => {
    // IndexedDB keeps dummy data across reloads; a Map is the fallback where it's unavailable (e.g. some private modes).
    const store = typeof indexedDB === "undefined" ? createMemoryStore() : createIdbStore();
    await seedIfEmpty(store);
    return store;
  })();
  return storePromise;
}

// Answers RTK Query calls in the browser, in the same shape fetchBaseQuery gives: { data } or { error: { status, data } }.
export const mockBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args) => {
  const { url, method = "GET", params, body } = typeof args === "string" ? { url: args } : args;
  const store = await getStore();
  const db = records(store);

  const response = await handleMockRequest(
    { url, method, params, body },
    { db, store, userId: await db.session.userId(), now: () => new Date() }
  );
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  // A JSON round trip, so callers can never mutate what the mock stored.
  const data = response.data === undefined ? null : JSON.parse(JSON.stringify(response.data));
  return response.status < 400 ? { data } : { error: { status: response.status, data } };
};

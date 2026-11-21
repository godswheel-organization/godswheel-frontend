import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { getSessionIdentity, type SessionIdentity } from "../auth/accessToken";
import { DEFAULT_SETTINGS, records } from "./records";
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

  // Sign-in is live, so "who is signed in" comes from the real API's session, not the mock's own. The mock keeps
  // that user's library, notes and settings under their real account id.
  const identity = getSessionIdentity();
  if (identity) await linkLiveUser(db, identity);

  const response = await handleMockRequest(
    { url, method, params, body },
    { db, store, userId: identity?.id ?? null, now: () => new Date() }
  );
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  // A JSON round trip, so callers can never mutate what the mock stored.
  const data = response.data === undefined ? null : JSON.parse(JSON.stringify(response.data));
  return response.status < 400 ? { data } : { error: { status: response.status, data } };
};

// Gives a user signed in through the real API a record in the mock, so mock screens that read the profile
// (the data export) know their name and email. No password: they never sign in to the mock itself.
async function linkLiveUser(db: ReturnType<typeof records>, identity: SessionIdentity) {
  const users = await db.users.all();
  if (users.some((user) => user.id === identity.id)) return;
  const [firstName = "", ...rest] = identity.fullName.trim().split(/\s+/);
  await db.users.save([
    ...users,
    {
      id: identity.id,
      firstName,
      lastName: rest.join(" "),
      email: identity.email.toLowerCase(),
      passwordHash: "",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  await db.settings.save(identity.id, DEFAULT_SETTINGS);
}

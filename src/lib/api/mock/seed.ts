import type { SermonNote } from "@/features/notes/types";
import { DEMO_ACCOUNT } from "./demoAccount";
import { hashPassword } from "./password";
import { DEFAULT_SETTINGS, records, type StoredHistory, type StoredSaved } from "./records";
import type { MockStore } from "./store";

const DEMO_USER_ID = "user_demo_ada";

const minutesAgo = (now: Date, minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
const DAY = 24 * 60;

// Fills an empty store with the demo account and some history, so every library screen has something to show.
// Runs once: an existing store (including one where the demo account was edited) is left alone.
export async function seedIfEmpty(store: MockStore, now = new Date()): Promise<void> {
  const db = records(store);
  if ((await db.users.all()).length > 0) return;

  await db.users.save([
    {
      id: DEMO_USER_ID,
      firstName: "Ada",
      lastName: "Okafor",
      email: DEMO_ACCOUNT.email,
      passwordHash: hashPassword(DEMO_ACCOUNT.password),
      createdAt: minutesAgo(now, 30 * DAY),
    },
  ]);

  const saved: StoredSaved[] = [
    { sermonId: "living-by-faith", savedAt: minutesAgo(now, 1 * DAY) },
    { sermonId: "the-power-of-prayer", savedAt: minutesAgo(now, 2 * DAY) },
    { sermonId: "arise-and-shine", savedAt: minutesAgo(now, 3 * DAY) },
    { sermonId: "created-on-purpose", savedAt: minutesAgo(now, 5 * DAY) },
    { sermonId: "the-anchor-of-hope", savedAt: minutesAgo(now, 8 * DAY) },
  ];
  await db.saved.save(DEMO_USER_ID, saved);

  const history: StoredHistory[] = [
    { sermonId: "arise-and-shine", positionSeconds: 12 * 60 + 48, playedAt: minutesAgo(now, 30), finished: false },
    { sermonId: "living-by-faith", positionSeconds: 34 * 60, playedAt: minutesAgo(now, 3 * 60), finished: false },
    { sermonId: "the-power-of-prayer", positionSeconds: 45 * 60, playedAt: minutesAgo(now, DAY + 60), finished: true },
    { sermonId: "created-on-purpose", positionSeconds: 4 * 60, playedAt: minutesAgo(now, DAY + 3 * 60), finished: false },
  ];
  await db.history.save(DEMO_USER_ID, history);

  const notes: SermonNote[] = [
    {
      id: "note_demo_1",
      sermonId: "arise-and-shine",
      atSeconds: 6 * 60 + 20,
      text: "I want to make more room for Scripture and prayer in my mornings.",
      createdAt: minutesAgo(now, 2 * DAY),
    },
  ];
  await db.notes.save(DEMO_USER_ID, notes);
  await db.settings.save(DEMO_USER_ID, DEFAULT_SETTINGS);
}

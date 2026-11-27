import type { HistoryEntry } from "@/features/library/types";
import { fail, field, noContent, ok, type MockRoute } from "../http";
import { findSermon } from "../sermonCatalog";

// Within this many seconds of the end counts as finished (outros, closing prayers).
export const FINISHED_WITHIN_SECONDS = 10;

// The listening history list, on this device: the API keeps each sermon's position but has no list of them yet.
// (Saved sermons are the live API's bookmarks.)
export const libraryRoutes: MockRoute[] = [
  // ---- Listening history ----
  {
    method: "GET",
    path: "/history",
    auth: true,
    async handle(_request, { db, userId }) {
      const entries = await Promise.all(
        (await db.history.list(userId)).map(async (entry) => ({ ...entry, sermon: await findSermon(entry.sermonId) }))
      );
      const items: HistoryEntry[] = entries
        .flatMap(({ sermon, ...entry }) => (sermon ? [{ ...entry, sermon }] : []))
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
        .map(({ sermon, positionSeconds, playedAt, finished }) => ({ sermon, positionSeconds, playedAt, finished }));
      return ok(items);
    },
  },
  {
    method: "PUT",
    path: "/history/:sermonId",
    auth: true,
    async handle({ params, body }, { db, userId, now }) {
      const sermon = await findSermon(params.sermonId);
      if (!sermon) return fail(404, "not_found");
      const position = field(body, "positionSeconds");
      if (typeof position !== "number" || !Number.isFinite(position) || position < 0) {
        return fail(400, "bad_request", "positionSeconds must be a non-negative number.");
      }
      // Without a known length, the position is taken as given and the sermon never counts as finished.
      const duration = sermon.durationSeconds ?? Infinity;
      const positionSeconds = Math.min(Math.round(position), duration);
      const entry = {
        sermonId: sermon.id,
        positionSeconds,
        playedAt: now().toISOString(),
        finished: positionSeconds >= duration - FINISHED_WITHIN_SECONDS,
      };
      const others = (await db.history.list(userId)).filter((item) => item.sermonId !== sermon.id);
      await db.history.save(userId, [...others, entry]);
      return noContent();
    },
  },
  {
    method: "DELETE",
    path: "/history/:sermonId",
    auth: true,
    async handle({ params }, { db, userId }) {
      await db.history.save(userId, (await db.history.list(userId)).filter((item) => item.sermonId !== params.sermonId));
      return noContent();
    },
  },
  {
    method: "DELETE",
    path: "/history",
    auth: true,
    async handle(_request, { db, userId }) {
      await db.history.save(userId, []);
      return noContent();
    },
  },
];

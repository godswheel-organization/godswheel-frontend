import type { HistoryEntry, SavedSermon } from "@/features/library/types";
import { sermons } from "@/features/sermons/mocks/sermons";
import type { Sermon } from "@/features/sermons/types";
import { fail, field, noContent, ok, type MockRoute } from "../http";

const sermonById = (id: string): Sermon | undefined => sermons.find((sermon) => sermon.id === id);

// Within this many seconds of the end counts as finished (outros, closing prayers).
export const FINISHED_WITHIN_SECONDS = 10;

export const libraryRoutes: MockRoute[] = [
  // ---- Saved sermons ----
  {
    method: "GET",
    path: "/library/sermons",
    auth: true,
    async handle(_request, { db, userId }) {
      const items: SavedSermon[] = (await db.saved.list(userId))
        .flatMap(({ sermonId, savedAt }) => {
          const sermon = sermonById(sermonId);
          return sermon ? [{ sermon, savedAt }] : [];
        })
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
      return ok(items);
    },
  },
  {
    method: "PUT",
    path: "/library/sermons/:sermonId",
    auth: true,
    async handle({ params }, { db, userId, now }) {
      if (!sermonById(params.sermonId)) return fail(404, "not_found");
      const saved = await db.saved.list(userId);
      if (!saved.some((item) => item.sermonId === params.sermonId)) {
        await db.saved.save(userId, [...saved, { sermonId: params.sermonId, savedAt: now().toISOString() }]);
      }
      return noContent();
    },
  },
  {
    method: "DELETE",
    path: "/library/sermons/:sermonId",
    auth: true,
    async handle({ params }, { db, userId }) {
      await db.saved.save(userId, (await db.saved.list(userId)).filter((item) => item.sermonId !== params.sermonId));
      return noContent();
    },
  },

  // ---- Listening history ----
  {
    method: "GET",
    path: "/history",
    auth: true,
    async handle(_request, { db, userId }) {
      const items: HistoryEntry[] = (await db.history.list(userId))
        .flatMap((entry) => {
          const sermon = sermonById(entry.sermonId);
          return sermon ? [{ ...entry, sermon }] : [];
        })
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
      const sermon = sermonById(params.sermonId);
      if (!sermon) return fail(404, "not_found");
      const position = field(body, "positionSeconds");
      if (typeof position !== "number" || !Number.isFinite(position) || position < 0) {
        return fail(400, "bad_request", "positionSeconds must be a non-negative number.");
      }
      const duration = sermon.durationMinutes * 60;
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

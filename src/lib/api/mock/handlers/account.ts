import { fail, field, ok, type MockRoute } from "../http";
import { findSermon } from "../sermonCatalog";

const titleOf = async (sermonId: string) => (await findSermon(sermonId))?.title ?? sermonId;

// Each record with its sermon's title added under `key`.
const withTitles = <T extends { sermonId: string }>(records: T[], key: string) =>
  Promise.all(records.map(async (record) => ({ ...record, [key]: await titleOf(record.sermonId) })));

export const accountRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/me/settings",
    auth: true,
    handle: async (_request, { db, userId }) => ok(await db.settings.get(userId)),
  },
  {
    method: "PATCH",
    path: "/me/settings",
    auth: true,
    async handle({ body }, { db, userId }) {
      const allowAnalytics = field(body, "allowAnalytics");
      if (typeof allowAnalytics !== "boolean") return fail(400, "bad_request", "allowAnalytics must be true or false.");
      const settings = { ...(await db.settings.get(userId)), allowAnalytics };
      await db.settings.save(userId, settings);
      return ok(settings);
    },
  },
  {
    // "Request a copy of my data": everything held about the user, never the password hash.
    method: "GET",
    path: "/me/export",
    auth: true,
    async handle(_request, { db, userId, now }) {
      const user = (await db.users.all()).find((candidate) => candidate.id === userId);
      if (!user) return fail(404, "not_found");
      return ok({
        exportedAt: now().toISOString(),
        profile: { firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt },
        settings: await db.settings.get(userId),
        savedSermons: await withTitles(await db.saved.list(userId), "title"),
        listeningHistory: await withTitles(await db.history.list(userId), "title"),
        notes: await withTitles(await db.notes.list(userId), "sermonTitle"),
      });
    },
  },
];

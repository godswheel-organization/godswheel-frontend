import { sermons } from "@/features/sermons/mocks/sermons";
import { fail, field, ok, type MockRoute } from "../http";

const titleOf = (sermonId: string) => sermons.find((sermon) => sermon.id === sermonId)?.title ?? sermonId;

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
        savedSermons: (await db.saved.list(userId)).map((item) => ({ ...item, title: titleOf(item.sermonId) })),
        listeningHistory: (await db.history.list(userId)).map((item) => ({ ...item, title: titleOf(item.sermonId) })),
        notes: (await db.notes.list(userId)).map((note) => ({ ...note, sermonTitle: titleOf(note.sermonId) })),
      });
    },
  },
];

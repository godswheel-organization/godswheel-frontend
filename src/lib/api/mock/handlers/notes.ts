import { sermons } from "@/features/sermons/mocks/sermons";
import { fail, field, noContent, ok, text, type MockRoute } from "../http";

export const NOTE_MAX_LENGTH = 2000;

export const noteRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/notes",
    auth: true,
    async handle({ query }, { db, userId }) {
      const sermonId = query.get("sermonId");
      const notes = (await db.notes.list(userId))
        .filter((note) => !sermonId || note.sermonId === sermonId)
        .sort((a, b) => a.atSeconds - b.atSeconds);
      return ok(notes);
    },
  },
  {
    method: "POST",
    path: "/notes",
    auth: true,
    async handle({ body }, { db, userId, now }) {
      const sermonId = text(field(body, "sermonId"));
      const atSeconds = field(body, "atSeconds");
      const noteText = text(field(body, "text"));
      if (!sermons.some((sermon) => sermon.id === sermonId)) return fail(404, "not_found");
      if (typeof atSeconds !== "number" || atSeconds < 0) return fail(400, "bad_request", "atSeconds must be a non-negative number.");
      if (!noteText || noteText.length > NOTE_MAX_LENGTH) return fail(400, "bad_request", "A note needs 1–2000 characters.");

      const note = { id: `note_${crypto.randomUUID()}`, sermonId, atSeconds: Math.round(atSeconds), text: noteText, createdAt: now().toISOString() };
      await db.notes.save(userId, [...(await db.notes.list(userId)), note]);
      return ok(note, 201);
    },
  },
  {
    method: "DELETE",
    path: "/notes/:noteId",
    auth: true,
    async handle({ params }, { db, userId }) {
      await db.notes.save(userId, (await db.notes.list(userId)).filter((note) => note.id !== params.noteId));
      return noContent();
    },
  },
];

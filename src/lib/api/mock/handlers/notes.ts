import type { SermonNote } from "@/features/notes/types";
import { sermons } from "@/features/sermons/mocks/sermons";
import { fail, field, noContent, ok, text, type MockRoute } from "../http";

export const NOTE_MAX_LENGTH = 2000;

// One note per sermon. Stored data from before that rule may hold several for a sermon: the most recent wins,
// and the next save replaces them all.
const latestFor = (notes: SermonNote[], sermonId: string) =>
  notes
    .filter((note) => note.sermonId === sermonId)
    .sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))[0];

export const noteRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/notes/:sermonId",
    auth: true,
    async handle({ params }, { db, userId }) {
      const note = latestFor(await db.notes.list(userId), params.sermonId);
      return note ? ok(note) : fail(404, "not_found");
    },
  },
  {
    method: "PUT",
    path: "/notes/:sermonId",
    auth: true,
    async handle({ params, body }, { db, userId, now }) {
      const { sermonId } = params;
      const noteText = text(field(body, "text"));
      const atSeconds = field(body, "atSeconds");
      if (!sermons.some((sermon) => sermon.id === sermonId)) return fail(404, "not_found");
      if (!noteText || noteText.length > NOTE_MAX_LENGTH) return fail(400, "bad_request", `A note needs 1–${NOTE_MAX_LENGTH} characters.`);
      if (typeof atSeconds !== "number" || atSeconds < 0) return fail(400, "bad_request", "atSeconds must be a non-negative number.");

      const notes = await db.notes.list(userId);
      const existing = latestFor(notes, sermonId);
      const timestamp = now().toISOString();
      const note: SermonNote = {
        id: existing?.id ?? `note_${crypto.randomUUID()}`,
        sermonId,
        atSeconds: Math.round(atSeconds),
        text: noteText,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      await db.notes.save(userId, [...notes.filter((other) => other.sermonId !== sermonId), note]);
      return ok(note, existing ? 200 : 201);
    },
  },
  {
    method: "DELETE",
    path: "/notes/:sermonId",
    auth: true,
    async handle({ params }, { db, userId }) {
      await db.notes.save(userId, (await db.notes.list(userId)).filter((note) => note.sermonId !== params.sermonId));
      return noContent();
    },
  },
];

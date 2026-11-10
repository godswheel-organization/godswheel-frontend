import { REPORT_DETAILS_MAX, REPORT_REASONS } from "@/features/reports/lib/reasons";
import { sermons } from "@/features/sermons/mocks/sermons";
import { emailSchema } from "@/lib/validation/primitives";
import { fail, field, ok, text, type MockRoute } from "../http";

// Kept so the team can see what was sent while there's no backend (IndexedDB → "reports").
export const REPORTS_KEY = "reports";

export const reportRoutes: MockRoute[] = [
  {
    // Open to guests: anyone can flag a sermon or get in touch.
    method: "POST",
    path: "/reports",
    async handle({ body }, { store, userId, now }) {
      const reason = text(field(body, "reason"));
      const details = text(field(body, "details"));
      const email = text(field(body, "email"));
      const sermonId = text(field(body, "sermonId"));

      if (!REPORT_REASONS.some((option) => option.value === reason)) return fail(400, "bad_request", "Unknown reason.");
      if (reason === "other" && !details) return fail(400, "bad_request", "Details are required for Other.");
      if (details.length > REPORT_DETAILS_MAX) return fail(400, "bad_request", "Details are too long.");
      if (email && !emailSchema.safeParse(email).success) return fail(400, "bad_request", "Invalid email.");
      if (sermonId && !sermons.some((sermon) => sermon.id === sermonId)) return fail(404, "not_found");

      const report = {
        id: `report_${crypto.randomUUID()}`,
        sermonId: sermonId || null,
        reason,
        details,
        email: email || null,
        userId,
        createdAt: now().toISOString(),
      };
      await store.set(REPORTS_KEY, [...((await store.get<unknown[]>(REPORTS_KEY)) ?? []), report]);
      return ok({ id: report.id }, 201);
    },
  },
];

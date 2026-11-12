import { KJV_PASSAGES } from "@/features/bible/mocks/kjv";
import { fail, ok, type MockRoute } from "../http";

// KJV only: it is public domain. Other translations need a licence, which the real backend will hold.
const VERSIONS = [{ id: "KJV", name: "King James Version (KJV)" }];

export const bibleRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/bible/versions",
    handle: () => ok(VERSIONS),
  },
  {
    method: "GET",
    path: "/bible/passage",
    handle({ query }) {
      const reference = query.get("ref") ?? "";
      const version = query.get("version") ?? "KJV";
      if (!VERSIONS.some((candidate) => candidate.id === version)) return fail(404, "not_found", "Unknown Bible version.");
      const passage = KJV_PASSAGES[reference];
      return passage ? ok({ reference, version, text: passage }) : fail(404, "not_found", "Passage not available.");
    },
  },
];

import type { Sermon } from "../types";

// Test fixture: a complete Sermon with only the fields a test cares about overridden.
export function testSermon(overrides: Partial<Sermon> & Pick<Sermon, "id">): Sermon {
  return {
    title: "Untitled",
    preacher: "Pastor Ruth Bamidele",
    scripture: "John 4:24",
    durationMinutes: 40,
    language: "English",
    topic: "worship",
    description: "",
    source: { name: "Test Ministry", rights: "" },
    publishedAt: "2026-01-01",
    ...overrides,
  };
}

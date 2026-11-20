import { describe, expect, it } from "vitest";
import { sermonJsonLd, sermonSeoDescription, sermonSeoTitle } from "./sermonSeo";
import { testSermon } from "./testSermon";

const sermon = testSermon({
  id: "living-by-faith",
  title: "Living by Faith",
  preacher: "Pastor Daniel Okafor",
  scripture: "Hebrews 11:1",
  durationMinutes: 42,
  topic: "faith",
  relatedTopics: ["prayer"],
  description: "Faith is the substance of things hoped for.",
});

describe("sermon SEO", () => {
  it("titles a sermon by its name and preacher", () => {
    expect(sermonSeoTitle(sermon)).toBe("Living by Faith by Pastor Daniel Okafor");
  });

  it("leads the description with the passage and length, and cuts long ones at a word", () => {
    expect(sermonSeoDescription(sermon)).toBe("Hebrews 11:1 · 42 min. Faith is the substance of things hoped for.");
    const long = sermonSeoDescription({ ...sermon, description: "word ".repeat(80) }, 60);
    expect(long.length).toBeLessThanOrEqual(60);
    expect(long).toMatch(/word…$/);
  });

  it("describes the sermon as audio, with breadcrumbs through its category", () => {
    const [audio, breadcrumbs] = sermonJsonLd(sermon);
    expect(audio).toMatchObject({
      "@type": "AudioObject",
      name: "Living by Faith",
      duration: "PT42M",
      inLanguage: "en",
      datePublished: "2026-01-01",
      author: { "@type": "Person", name: "Pastor Daniel Okafor" },
      keywords: "Faith, Prayer, Hebrews 11:1",
    });
    expect(audio).not.toHaveProperty("contentUrl");
    expect(String(audio.url)).toMatch(/\/sermons\/living-by-faith$/);
    expect((breadcrumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual([
      "Sermons",
      "Faith",
      "Living by Faith",
    ]);
  });
});

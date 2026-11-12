import { describe, expect, it } from "vitest";
import { matchSermon, searchSermons } from "./searchSermons";
import { testSermon } from "./testSermon";

const catalogue = [
  testSermon({ id: "speaker", title: "Morning Light", preacher: "Faith Adebayo", scripture: "Psalm 5:3" }),
  testSermon({ id: "topic", title: "Stand Firm", topic: "faith", scripture: "Ephesians 6:13" }),
  testSermon({ id: "title", title: "Living by Faith", scripture: "Hebrews 11:1" }),
  testSermon({ id: "related", title: "Daily Bread", topic: "prayer", relatedTopics: ["faith"], scripture: "Matthew 6:11" }),
  testSermon({ id: "none", title: "A Heart of Worship" }),
];

const summary = (results: ReturnType<typeof searchSermons>) => results.map((r) => `${r.sermon.id}:${r.matchedIn}`);

describe("matchSermon", () => {
  it("reports the strongest field and ignores case and padding", () => {
    expect(matchSermon(catalogue[2], "  FAITH ")).toBe("title");
    expect(matchSermon(catalogue[0], "faith")).toBe("speaker");
    expect(matchSermon(catalogue[1], "faith")).toBe("topic");
    expect(matchSermon(catalogue[3], "faith")).toBe("topic");
  });

  it("matches nothing for an empty query or a miss", () => {
    expect(matchSermon(catalogue[2], "   ")).toBeNull();
    expect(matchSermon(catalogue[4], "faith")).toBeNull();
  });
});

describe("searchSermons", () => {
  it("ranks title, then speaker, then scripture, then topic matches", () => {
    expect(summary(searchSermons(catalogue, "faith", "all"))).toEqual([
      "title:title",
      "speaker:speaker",
      "topic:topic",
      "related:topic",
    ]);
  });

  it("limits the search to speakers or scripture", () => {
    expect(summary(searchSermons(catalogue, "faith", "speaker"))).toEqual(["speaker:speaker"]);
    expect(summary(searchSermons(catalogue, "hebrews", "scripture"))).toEqual(["title:scripture"]);
    expect(searchSermons(catalogue, "faith", "scripture")).toEqual([]);
  });
});

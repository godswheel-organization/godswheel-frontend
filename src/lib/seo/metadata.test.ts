import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("gives a public page its canonical URL and link-preview text", () => {
    const metadata = pageMetadata({ title: "About and standards", description: "How it works.", path: "/about" });
    expect(metadata).toMatchObject({
      title: "About and standards",
      alternates: { canonical: "/about" },
      openGraph: { title: "About and standards · GodsWheel", description: "How it works.", url: "/about", siteName: "GodsWheel" },
      twitter: { card: "summary_large_image" },
    });
    expect(metadata.robots).toBeUndefined();
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ url: "/opengraph-image" })]);
  });

  it("leaves the image out for a route that draws its own", () => {
    const metadata = pageMetadata({ title: "A sermon", path: "/sermons/x", ownImage: true });
    expect(metadata.openGraph).not.toHaveProperty("images");
  });

  it("keeps private pages out of search, with no preview card", () => {
    const metadata = pageMetadata({ title: "Settings", noIndex: true });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
  });
});

import type { CategoryRef } from "../types";

// The API's categories (GET /categories), copied with their real ids so the mock sermons line up with the live
// list until the sermons endpoint is integrated. The app's category lists themselves come from the API.
export const MOCK_CATEGORIES: CategoryRef[] = [
  { id: "45259f7e-51ca-79b1-3309-83a6c86a3377", slug: "biblical-doctrine", name: "Biblical Doctrine" },
  { id: "e57b06f7-9526-3a4c-91fa-4d0e644be8ea", slug: "biblical-history", name: "Biblical History" },
  { id: "20cd40d8-6af5-75a3-0132-d2a6771f3fda", slug: "christian-living", name: "Christian Living" },
  { id: "90936959-a3bd-8921-24e8-2ca7e40cd35f", slug: "evangelism-discipleship", name: "Evangelism & Discipleship" },
  { id: "a017e80b-34ad-f3e0-e481-51eee3e86ccf", slug: "faith-trust", name: "Faith & Trust" },
  { id: "3fafef13-6496-6345-03ac-b8dea788a6bf", slug: "holy-spirit", name: "Holy Spirit" },
  { id: "957ae7e8-f3a6-cbf3-3973-13cd9c91d369", slug: "hope-encouragement", name: "Hope & Encouragement" },
  { id: "9dcef25a-d9c1-ba37-76f2-16834cdd1178", slug: "jesus-christ", name: "Jesus Christ" },
  { id: "74842718-3934-c6bb-aa35-bcda5ac1e6a2", slug: "leadership", name: "Leadership" },
  { id: "b8d29db7-15ca-0499-3204-bd05ebfa3dd8", slug: "love-relationships", name: "Love & Relationships" },
  { id: "d89900b5-6ec7-3e6e-95a5-7af61a5b1c55", slug: "prayer-worship", name: "Prayer & Worship" },
  { id: "bc598e96-91e5-d47b-7817-dc0617ca5b0b", slug: "salvation", name: "Salvation" },
  { id: "6f2b9b8a-5937-2a43-9056-0ce6e9f94117", slug: "salvation-redemption", name: "Salvation & Redemption" },
  { id: "0d33e641-8de4-f241-1de3-27653bf4a38f", slug: "spiritual-growth", name: "Spiritual Growth" },
];

export function mockCategories(...slugs: string[]): CategoryRef[] {
  return slugs.map((slug) => {
    const category = MOCK_CATEGORIES.find((candidate) => candidate.slug === slug);
    if (!category) throw new Error(`Unknown mock category: ${slug}`);
    return category;
  });
}

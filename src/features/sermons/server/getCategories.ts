import type { SermonCategory } from "../types";
import { apiGetAll, remembered } from "./apiFetch";

// Server-side GET /categories, for the landing grid, home chips, Browse titles and the sitemap. Kept for five
// minutes, so a category added or removed in the admin shows up soon after. If the API can't be reached, the last good list is used (or none, and those sections
// are skipped).
export const getCategories = remembered(() => apiGetAll<SermonCategory>("/categories"), {
  ttlMs: 5 * 60 * 1000,
  fallback: [] as SermonCategory[],
});

export async function getCategory(slug: string): Promise<SermonCategory | undefined> {
  return (await getCategories()).find((category) => category.slug === slug);
}

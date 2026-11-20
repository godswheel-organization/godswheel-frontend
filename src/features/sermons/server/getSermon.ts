import { cache } from "react";
import { sermons } from "../mocks/sermons";
import type { Sermon } from "../types";

// Server-side read for the sermon detail page (a Server Component can't use RTK Query hooks).
// cache() lets generateMetadata and the page share one lookup per request.
// TODO(backend): replace with a fetch to the sermons API, e.g. `${API}/sermons/${id}`, returning null on 404.
export const getSermon = cache(async (id: string): Promise<Sermon | null> => {
  return sermons.find((sermon) => sermon.id === id) ?? null;
});

// Every published sermon, for the sitemap.
// TODO(backend): replace with a fetch of the sermon list (ids and publish dates are all the sitemap needs).
export const getAllSermons = cache(async (): Promise<Sermon[]> => sermons);

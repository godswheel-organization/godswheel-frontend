import { filterSermons, sermonFilterOptions } from "@/features/sermons/lib/filterSermons";
import { parseSearchQuery } from "@/features/sermons/lib/searchQuery";
import { searchSermons } from "@/features/sermons/lib/searchSermons";
import { parseSermonFilters } from "@/features/sermons/lib/sermonFilters";
import { sermons } from "@/features/sermons/mocks/sermons";
import { fail, ok, type MockRoute } from "../http";

// The catalogue is public: none of these need a session.
export const sermonRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/sermons",
    handle({ query }) {
      const items = filterSermons(sermons, parseSermonFilters(query));
      return ok({ items, total: items.length });
    },
  },
  {
    method: "GET",
    path: "/sermons/search",
    handle({ query }) {
      const { q, scope } = parseSearchQuery(query);
      const items = searchSermons(sermons, q, scope);
      return ok({ items, total: items.length });
    },
  },
  {
    method: "GET",
    path: "/sermons/filter-options",
    handle: () => ok(sermonFilterOptions(sermons)),
  },
  {
    method: "GET",
    path: "/sermons/:sermonId",
    handle({ params }) {
      const sermon = sermons.find((candidate) => candidate.id === params.sermonId);
      return sermon ? ok(sermon) : fail(404, "not_found");
    },
  },
];

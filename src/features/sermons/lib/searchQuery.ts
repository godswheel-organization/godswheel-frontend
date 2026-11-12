import type { SearchScope } from "../types";

// The Search tab keeps its state in the URL (?q=&in=), like Browse, so Back and shared links restore it.

export const SEARCH_SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "speaker", label: "Speaker" },
  { value: "scripture", label: "Scripture" },
];

export interface SearchQuery {
  q: string;
  scope: SearchScope;
}

const isScope = (value: string | null): value is SearchScope =>
  value !== null && SEARCH_SCOPES.some((scope) => scope.value === value);

export function parseSearchQuery(params: URLSearchParams): SearchQuery {
  const scope = params.get("in");
  return { q: params.get("q")?.trim() ?? "", scope: isScope(scope) ? scope : "all" };
}

// Leaves out an empty search and the default scope, so a fresh Search tab is just /search.
export function toSearchQueryParams({ q, scope }: SearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (scope !== "all") params.set("in", scope);
  return params;
}

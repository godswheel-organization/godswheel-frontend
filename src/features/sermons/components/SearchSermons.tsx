"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Chip from "@/shared/ui/chip/Chip";
import ChipRow from "@/shared/ui/chip/ChipRow";
import Container from "@/shared/ui/container/Container";
import { useSearchSermonsQuery } from "../api/sermonsApi";
import { parseSearchQuery, SEARCH_SCOPES, toSearchQueryParams, type SearchQuery } from "../lib/searchQuery";
import { TOPIC_ORDER, TOPICS } from "../lib/topics";
import type { MatchField } from "../types";
import SermonListItem from "./SermonListItem";
import SermonSearchInput from "./SermonSearchInput";

const MATCH_LABELS: Record<MatchField, string> = {
  title: "Matched in title",
  speaker: "Matched in speaker",
  scripture: "Matched in scripture",
  topic: "Matched in topic",
};

// The Search tab. Like Browse, the URL (?q=&in=) is the only state: the box and chips write it, results read it.
export default function SearchSermons() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => parseSearchQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const { data } = useSearchSermonsQuery(query, { skip: !query.q });

  const hrefFrom = useCallback(
    (base: SearchQuery, changes: Partial<SearchQuery>) => {
      const params = toSearchQueryParams({ ...base, ...changes }).toString();
      return params ? `${pathname}?${params}` : pathname;
    },
    [pathname]
  );
  // Merges onto the URL as it is *now*: the search box calls this 300ms after the last keystroke,
  // by which time a scope chip may have changed it (see BrowseSermons for the same guard).
  const update = (changes: Partial<SearchQuery>) => {
    const current = parseSearchQuery(new URLSearchParams(window.location.search));
    router.replace(hrefFrom(current, changes), { scroll: false });
  };

  const cancel = () => {
    if (window.history.length > 1) router.back();
    else router.push(ROUTES.home);
  };

  return (
    <Container className="py-6 md:py-10">
      <h1 className="sr-only md:not-sr-only md:mb-6 md:text-3xl md:font-bold md:text-foreground">Search</h1>

      <div className="flex items-center gap-3">
        <SermonSearchInput
          value={query.q}
          onSearch={(q) => update({ q })}
          placeholder="Search titles, speakers, scripture"
          autoFocus
        />
        <button
          type="button"
          onClick={cancel}
          className="shrink-0 px-1 text-base text-foreground transition hover:text-brand-300"
        >
          Cancel
        </button>
      </div>

      <ChipRow label="Search in" className="mt-5">
        {SEARCH_SCOPES.map((scope) => (
          <li key={scope.value}>
            <Chip href={hrefFrom(query, { scope: scope.value })} active={query.scope === scope.value} scroll={false}>
              {scope.label}
            </Chip>
          </li>
        ))}
      </ChipRow>

      {query.q ? (
        <section aria-labelledby="search-results-title" className="mt-8">
          <h2 id="search-results-title" aria-live="polite" className="text-xl font-semibold text-foreground">
            {data ? `${data.total} ${data.total === 1 ? "result" : "results"} for ‘${query.q}’` : " "}
          </h2>

          {data && data.total > 0 && (
            <ul className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-2">
              {data.items.map(({ sermon, matchedIn }) => (
                <li key={sermon.id}>
                  <p className="mb-1.5 inline-block rounded-md bg-surface px-2 py-1 text-xs text-muted">
                    {MATCH_LABELS[matchedIn]}
                  </p>
                  <SermonListItem sermon={sermon} />
                </li>
              ))}
            </ul>
          )}

          {data && data.total === 0 && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
              <p className="text-lg font-semibold text-foreground">Nothing found</p>
              <p className="text-muted">
                {query.scope === "all" ? "Check the spelling, or try a speaker or a verse." : "Try searching everything instead."}
              </p>
            </div>
          )}
        </section>
      ) : (
        // Before anything is typed: a nudge, and topics as a way in.
        <section aria-labelledby="search-suggestions-title" className="mt-10">
          <h2 id="search-suggestions-title" className="text-sm font-medium text-muted">
            Or start with a topic
          </h2>
          <ChipRow label="Topics" className="mt-4">
            {TOPIC_ORDER.map((topic) => (
              <li key={topic}>
                <Chip href={ROUTES.sermonsByTopic(topic)}>{TOPICS[topic].label}</Chip>
              </li>
            ))}
          </ChipRow>
        </section>
      )}
    </Container>
  );
}

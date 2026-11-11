"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, SlidersHorizontal } from "lucide-react";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import { useGetSermonsQuery } from "../api/sermonsApi";
import { hasActiveFilters, parseSermonFilters, toSermonSearchParams } from "../lib/sermonFilters";
import type { SermonFilters } from "../types";
import ActiveFilters from "./ActiveFilters";
import FilterSheet from "./FilterSheet";
import ResultsBar from "./ResultsBar";
import SermonListItem from "./SermonListItem";
import SermonListSkeleton from "./SermonListSkeleton";
import SermonSearchInput from "./SermonSearchInput";
import TopicChips from "./TopicChips";

const NO_FILTERS = { topic: undefined, speaker: undefined, book: undefined } as const;

interface BrowseSermonsProps {
  title: string;
}

// The sermon directory. The URL is the single source of truth for filters: every control below
// just writes a new URL, and the list re-queries from whatever the URL says.
export default function BrowseSermons({ title }: BrowseSermonsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = useMemo(() => parseSermonFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const { data, isError, refetch } = useGetSermonsQuery(filters);

  const hrefFrom = useCallback(
    (base: SermonFilters, changes: Partial<SermonFilters>) => {
      const query = toSermonSearchParams({ ...base, ...changes }).toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname]
  );
  // For links rendered now (the topic chips).
  const hrefWith = (changes: Partial<SermonFilters>) => hrefFrom(filters, changes);

  // For changes that may run later than the render that created them (the search box fires 300ms after
  // the last keystroke): merge onto the URL as it is *now*, or a stale callback would undo a chip tapped
  // in the meantime. replace, not push, so typing and toggling don't fill the Back button.
  const update = (changes: Partial<SermonFilters>) => {
    const current = parseSermonFilters(new URLSearchParams(window.location.search));
    router.replace(hrefFrom(current, changes), { scroll: false });
  };

  const sheetFilterCount = [filters.topic, filters.speaker, filters.book].filter(Boolean).length;

  return (
    <Container className="py-6 md:py-10">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>

      <div className="mt-6 flex items-center gap-3">
        <SermonSearchInput value={filters.q ?? ""} onSearch={(q) => update({ q })} />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-label={sheetFilterCount ? `Filters, ${sheetFilterCount} applied` : "Filters"}
          className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-foreground ring-1 ring-inset ring-border transition hover:bg-gray-700"
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          {sheetFilterCount > 0 && (
            <span aria-hidden className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-on-brand">
              {sheetFilterCount}
            </span>
          )}
        </button>
      </div>

      <TopicChips className="mt-6" activeTopic={filters.topic} hrefFor={(topic) => hrefWith({ topic })} scroll={false} />

      {hasActiveFilters(filters) && (
        <ActiveFilters
          className="mt-5"
          filters={filters}
          onRemove={(filter) => update({ [filter]: undefined })}
          onClearAll={() => update(NO_FILTERS)}
        />
      )}

      <section aria-label="Results" className="mt-8">
        <ResultsBar total={data?.total} sort={filters.sort} onSortChange={(sort) => update({ sort })} />

        {isError && (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-border p-6">
            <p className="text-foreground">We couldn&rsquo;t load sermons just now.</p>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!data && !isError && <SermonListSkeleton className="mt-4 lg:grid-cols-2" count={4} />}

        {data && data.items.length > 0 && (
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.items.map((sermon) => (
              <li key={sermon.id}>
                <SermonListItem sermon={sermon} />
              </li>
            ))}
          </ul>
        )}

        {data && data.items.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
            <div>
              <p className="text-lg font-semibold text-foreground">No sermons match</p>
              <p className="mt-1 text-muted">Try another word, or loosen the filters.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => update({ ...NO_FILTERS, q: undefined })}>
              Clear search and filters
            </Button>
          </div>
        )}
      </section>

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={{ topic: filters.topic, speaker: filters.speaker, book: filters.book }}
        onApply={(next) => update(next)}
      />
    </Container>
  );
}

"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { History } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/shared/ui/skeleton/Skeleton";
import { useGetCategoriesQuery } from "../api/sermonsApi";
import { categoryStyle } from "../lib/categories";
import { parseSermonFilters } from "../lib/sermonFilters";
import type { SermonCategory } from "../types";

// The sidebar's four shortcuts into the directory, as designed (the chips on Browse list every category).
// Picked from the API's live list; if any of these go away, the list's first categories fill in.
const SHORTCUT_SLUGS = [
  "faith-trust",
  "prayer-worship",
  "holy-spirit",
  "spiritual-growth",
];
const SHORTCUT_COUNT = 4;

function shortcutsFrom(categories: SermonCategory[]): SermonCategory[] {
  const picked = SHORTCUT_SLUGS.flatMap((slug) =>
    categories.filter((category) => category.slug === slug),
  );
  const rest = categories.filter((category) => !picked.includes(category));
  return [...picked, ...rest].slice(0, SHORTCUT_COUNT);
}

const itemClasses =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition";
const idle = "text-muted hover:bg-surface/60 hover:text-foreground";
const active = "bg-surface text-brand-500";

// Desktop sidebar section: category shortcuts and listening history. A category stays lit while Browse is filtered by it.
export default function ExploreNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Read the way Browse reads it, so old ?topic= links light the right shortcut too.
  const activeCategory =
    pathname === ROUTES.sermons ? parseSermonFilters(new URLSearchParams(searchParams.toString())).category : undefined;
  const { data: categories } = useGetCategoriesQuery();
  const onHistory = pathname === ROUTES.libraryHistory;
  // Shown in both the sidebar and the phone drawer, so the heading id must be unique per copy.
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="px-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted"
      >
        Explore
      </h2>
      <ul className="mt-3 flex flex-col gap-1">
        {!categories &&
          Array.from({ length: SHORTCUT_COUNT }, (_, index) => (
            <li
              key={index}
              aria-hidden
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-4 w-28" />
            </li>
          ))}
        {categories &&
          shortcutsFrom(categories).map((category) => {
            const { icon: Icon } = categoryStyle(category.slug);
            const isActive = activeCategory === category.slug;
            return (
              <li key={category.slug}>
                <Link
                  href={ROUTES.sermonsByCategory(category.slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(itemClasses, isActive ? active : idle)}
                >
                  <Icon
                    className="size-5 shrink-0 text-brand-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="truncate">{category.name}</span>
                </Link>
              </li>
            );
          })}
        <li>
          <Link
            href={ROUTES.libraryHistory}
            aria-current={onHistory ? "page" : undefined}
            className={cn(itemClasses, onHistory ? active : idle)}
          >
            <History className="size-5" strokeWidth={1.75} aria-hidden />
            History
          </Link>
        </li>
      </ul>
    </nav>
  );
}

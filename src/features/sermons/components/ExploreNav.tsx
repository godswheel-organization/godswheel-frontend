"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { History } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { TOPICS } from "../lib/topics";
import type { SermonTopic } from "../types";

// The sidebar's shortcuts into the directory, as designed (the topic chips on Browse list them all).
const EXPLORE_TOPICS: SermonTopic[] = ["purpose", "calling", "faith", "prayer"];

const itemClasses = "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition";
const idle = "text-muted hover:bg-surface/60 hover:text-foreground";
const active = "bg-surface text-brand-500";

// Desktop sidebar section: topic shortcuts and listening history. A topic stays lit while Browse is filtered by it.
export default function ExploreNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTopic = pathname === ROUTES.sermons ? searchParams.get("topic") : null;
  const onHistory = pathname === ROUTES.libraryHistory;
  // Shown in both the sidebar and the phone drawer, so the heading id must be unique per copy.
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className="px-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
        Explore
      </h2>
      <ul className="mt-3 flex flex-col gap-1">
        {EXPLORE_TOPICS.map((topic) => {
          const { label, icon: Icon } = TOPICS[topic];
          const isActive = activeTopic === topic;
          return (
            <li key={topic}>
              <Link
                href={ROUTES.sermonsByTopic(topic)}
                aria-current={isActive ? "page" : undefined}
                className={cn(itemClasses, isActive ? active : idle)}
              >
                <Icon className="size-5 text-brand-500" strokeWidth={1.75} aria-hidden />
                {label}
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

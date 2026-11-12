"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import SignInGate from "@/features/auth/components/account-prompt/SignInGate";
import { useSession } from "@/features/auth/hooks/useSession";
import SermonListItem from "@/features/sermons/components/SermonListItem";
import SermonListSkeleton, { SermonListItemSkeleton } from "@/features/sermons/components/SermonListSkeleton";
import { ROUTES } from "@/lib/routes";
import Container from "@/shared/ui/container/Container";
import { useGetHistoryQuery, useGetSavedSermonsQuery } from "../api/libraryApi";
import { latestUnfinished } from "../lib/history";
import ContinueListeningCard from "./ContinueListeningCard";
import HistoryRow from "./HistoryRow";
import { HistoryListSkeleton, LibraryOverviewSkeleton } from "./LibrarySkeletons";

// How many of each list the overview shows before "See all".
const PREVIEW_COUNT = 2;

export default function LibraryOverview() {
  const { isSignedIn, isLoading: sessionLoading } = useSession();
  const { data: saved } = useGetSavedSermonsQuery(undefined, { skip: !isSignedIn });
  const { data: history } = useGetHistoryQuery(undefined, { skip: !isSignedIn });

  const resume = history && latestUnfinished(history);

  return (
    <Container className="py-6 md:py-10">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Your library</h1>

      {sessionLoading ? (
        <LibraryOverviewSkeleton />
      ) : !isSignedIn ? (
        <div className="mt-8">
          <SignInGate kind="library" />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {/* While history loads, hold the section's place so the page doesn't jump when it arrives. */}
          {(resume || !history) && (
            <Section id="continue" title="Continue listening">
              {resume ? <ContinueListeningCard entry={resume} /> : <SermonListItemSkeleton />}
            </Section>
          )}

          <Section id="saved" title="Saved sermons" seeAllHref={saved?.length ? ROUTES.librarySaved : undefined}>
            {!saved ? (
              <SermonListSkeleton count={PREVIEW_COUNT} className="lg:grid-cols-2" label="Loading saved sermons" />
            ) : saved.length === 0 ? (
              <Empty>Nothing saved yet. Tap the bookmark on any sermon to keep it here.</Empty>
            ) : (
              <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {saved.slice(0, PREVIEW_COUNT).map(({ sermon }) => (
                  <li key={sermon.id}>
                    <SermonListItem sermon={sermon} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section id="recent" title="Recently played" seeAllHref={history?.length ? ROUTES.libraryHistory : undefined}>
            {!history ? (
              <HistoryListSkeleton count={PREVIEW_COUNT} />
            ) : history.length === 0 ? (
              <Empty>Sermons you play will show up here.</Empty>
            ) : (
              <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {history.slice(0, PREVIEW_COUNT).map((entry) => (
                  <li key={entry.sermon.id}>
                    <HistoryRow entry={entry} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </Container>
  );
}

function Section({ id, title, seeAllHref, children }: { id: string; title: string; seeAllHref?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`library-${id}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={`library-${id}`} className="text-xl font-semibold text-foreground">
          {title}
        </h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-base text-foreground underline underline-offset-4 transition hover:text-brand-300">
            See all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-muted">{children}</p>;
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import SignInGate from "@/features/auth/components/account-prompt/SignInGate";
import { useSession } from "@/features/auth/hooks/useSession";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Container from "@/shared/ui/container/Container";
import Loader from "@/shared/ui/loaders/Loader";
import ConfirmSheet from "@/shared/ui/modal/ConfirmSheet";
import { useClearHistoryMutation, useGetHistoryQuery } from "../api/libraryApi";
import { groupByDay } from "../lib/history";
import HistoryRow from "./HistoryRow";

export default function RecentlyPlayedScreen() {
  const { isSignedIn, isLoading: sessionLoading } = useSession();
  const { data: history } = useGetHistoryQuery(undefined, { skip: !isSignedIn });
  const [clearHistory, { isLoading: clearing }] = useClearHistoryMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const clear = async () => {
    try {
      await clearHistory().unwrap();
      setConfirmOpen(false);
      toast.success("Listening history cleared");
    } catch {
      toast.error("Couldn't clear your history. Try again.");
    }
  };

  return (
    <Container className="py-4 md:py-8">
      <PageHeader title="Recently played" backHref={ROUTES.library} />

      {sessionLoading ? (
        <Loader className="py-16" label="Loading listening history" />
      ) : !isSignedIn ? (
        <div className="mt-8">
          <SignInGate kind="library" />
        </div>
      ) : !history ? (
        <Loader className="py-16" label="Loading listening history" />
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-muted">
              {history.length} {history.length === 1 ? "sermon" : "sermons"}
            </p>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-foreground underline underline-offset-4 transition hover:text-brand-300"
              >
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-muted">
              Sermons you play will show up here.
            </p>
          ) : (
            <div className="mt-6 flex flex-col gap-8">
              {groupByDay(history).map((group, index) => (
                // Index-based ids: labels like "3 Nov 2026" contain spaces, which aria-labelledby reads as separators.
                <section key={group.label} aria-labelledby={`history-group-${index}`}>
                  <h2 id={`history-group-${index}`} className="text-lg font-semibold text-foreground">
                    {group.label}
                  </h2>
                  <ul className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {group.entries.map((entry) => (
                      <li key={entry.sermon.id}>
                        <HistoryRow entry={entry} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear listening history?"
        message="This removes every sermon from Recently played and Continue listening. Saved sermons and notes stay."
        confirmLabel="Clear history"
        onConfirm={clear}
        busy={clearing}
      />
    </Container>
  );
}

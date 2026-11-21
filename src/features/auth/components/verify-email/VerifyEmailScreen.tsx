"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, LinkIcon, MailWarning } from "lucide-react";
import { toApiError } from "@/lib/api/apiError";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";
import { useVerifyEmailMutation } from "../../api/authApi";
import type { AuthSession } from "../../types";
import ResendVerificationForm from "./ResendVerificationForm";

type Outcome =
  | { status: "verifying" }
  | { status: "verified"; session: AuthSession }
  // The link can't work: no token, or the API says it's invalid, expired or already used (422).
  | { status: "invalid"; reason: "missing" | "rejected" }
  // Couldn't finish (no connection, or a server error): the link may still be good.
  | { status: "failed" };

// One verification per token, kept outside React: the token is single-use, and React runs effects twice in
// development, so a second call would spend it and turn a success into "link already used".
const verifications = new Map<string, Promise<Outcome>>();

// Opened from the link in the verification email (/verify-email?token=…).
export default function VerifyEmailScreen() {
  const searchParams = useSearchParams();
  // Read once: the token is taken out of the address bar straight after (see below).
  const [token] = useState(() => searchParams.get("token")?.trim() || null);
  const [verifyEmail] = useVerifyEmailMutation();
  const [outcome, setOutcome] = useState<Outcome>(token ? { status: "verifying" } : { status: "invalid", reason: "missing" });
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Keep the single-use token out of browser history, bookmarks and anything the address gets pasted into.
  useEffect(() => {
    if (token) window.history.replaceState(window.history.state, "", ROUTES.verifyEmail);
  }, [token]);

  // Starts (or joins) this token's verification. The state already says "verifying" when it's called.
  const verify = useCallback(() => {
    if (!token) return Promise.resolve<Outcome>({ status: "invalid", reason: "missing" });
    let verification = verifications.get(token);
    if (!verification) {
      verification = verifyEmail({ token })
        .unwrap()
        .then((session): Outcome => ({ status: "verified", session }))
        .catch((error: unknown): Outcome => {
          const { status, code } = toApiError(error);
          // A failed attempt may be retried; only a definite answer stays cached.
          if (status !== 422) verifications.delete(token);
          return status === 422 || code === "missing_token" ? { status: "invalid", reason: "rejected" } : { status: "failed" };
        });
      verifications.set(token, verification);
    }
    return verification;
  }, [token, verifyEmail]);

  useEffect(() => {
    if (!token) return;
    let current = true;
    void verify().then((result) => current && setOutcome(result));
    return () => {
      current = false;
    };
  }, [token, verify]);

  const retry = () => {
    setOutcome({ status: "verifying" });
    void verify().then(setOutcome);
  };

  // The result replaces the "verifying" state: move focus to its heading so screen readers announce it.
  useEffect(() => {
    if (outcome.status !== "verifying") headingRef.current?.focus();
  }, [outcome.status]);

  if (outcome.status === "verifying") {
    return (
      <div className="mt-8" aria-live="polite">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Verifying your email…</h1>
        <SkeletonGroup label="Verifying your email" className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-4 h-12 w-full rounded-xl" />
        </SkeletonGroup>
      </div>
    );
  }

  if (outcome.status === "verified") {
    return (
      <div className="mt-8 flex flex-col">
        <StatusIcon tone="success">
          <CircleCheck className="size-7" aria-hidden />
        </StatusIcon>
        <Heading ref={headingRef}>Email verified</Heading>
        <p className="mt-3 text-muted">
          Welcome to GodsWheel{outcome.session.firstName ? `, ${outcome.session.firstName}` : ""}. Your account is active and
          you&rsquo;re signed in.
        </p>
        <Button href={ROUTES.home} size="lg" className="mt-8 w-full">
          Start listening
        </Button>
        <Button href={ROUTES.library} variant="secondary" size="lg" className="mt-3 w-full">
          Go to your library
        </Button>
      </div>
    );
  }

  const failed = outcome.status === "failed";
  return (
    <div className="mt-8 flex flex-col">
      <StatusIcon tone="warning">{failed ? <MailWarning className="size-7" aria-hidden /> : <LinkIcon className="size-7" aria-hidden />}</StatusIcon>
      <Heading ref={headingRef}>{failed ? "We couldn't verify your email" : "This link doesn't work"}</Heading>
      <p className="mt-3 text-muted">
        {failed
          ? "Something went wrong on our side, or the connection dropped. Try again, or get a new link below."
          : outcome.reason === "missing"
            ? "The link is incomplete. Open it straight from the email, or get a new one below."
            : "It may have expired or already been used. If you've verified already, just sign in. Otherwise, get a new link below."}
      </p>

      {failed && (
        <Button type="button" size="lg" onClick={retry} className="mt-6 w-full">
          Try again
        </Button>
      )}

      <section aria-labelledby="new-link-title" className="mt-8 rounded-2xl border border-border bg-surface/40 p-4">
        <h2 id="new-link-title" className="font-semibold text-foreground">
          Get a new verification link
        </h2>
        <ResendVerificationForm className="mt-4" />
      </section>

      <Button href={ROUTES.signIn} variant={failed ? "secondary" : "primary"} size="lg" className="mt-6 w-full">
        Go to sign in
      </Button>
    </div>
  );
}

function StatusIcon({ tone, children }: { tone: "success" | "warning"; children: React.ReactNode }) {
  return (
    <span
      className={`flex size-14 items-center justify-center rounded-2xl ${tone === "success" ? "bg-brand-500/10 text-brand-500" : "bg-surface-raised text-foreground"}`}
    >
      {children}
    </span>
  );
}

function Heading({ ref, children }: { ref: React.Ref<HTMLHeadingElement>; children: React.ReactNode }) {
  return (
    <h1 ref={ref} tabIndex={-1} className="mt-6 text-2xl font-bold text-foreground focus:outline-none md:text-3xl">
      {children}
    </h1>
  );
}

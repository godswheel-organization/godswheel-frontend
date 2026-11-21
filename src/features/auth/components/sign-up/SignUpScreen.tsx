"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { safeRedirect } from "../../lib/safeRedirect";
import type { SignUpFormValues } from "../../schemas/auth.schema";
import SignUpForm from "./SignUpForm";
import SignUpSuccess from "./SignUpSuccess";

// The sign-up page's content: the form, then "Check your email" once the account is created.
// Kept in component state (not the URL), so the email address never ends up in history or logs.
export default function SignUpScreen() {
  const searchParams = useSearchParams();
  // Where the verification link went, once the account is created.
  const [sentTo, setSentTo] = useState<string | null>(null);
  // What was typed, for coming back to fix the email (the password isn't kept).
  const [draft, setDraft] = useState<Partial<SignUpFormValues>>();

  // Carry ?redirectTo on to sign-in, so after verifying the user ends up where they started.
  const redirectTo = searchParams.get("redirectTo");
  const signInHref = redirectTo
    ? `${ROUTES.signIn}?redirectTo=${encodeURIComponent(safeRedirect(redirectTo, ROUTES.home))}`
    : ROUTES.signIn;

  if (sentTo) {
    return <SignUpSuccess email={sentTo} signInHref={signInHref} onUseDifferentEmail={() => setSentTo(null)} />;
  }

  return (
    <SignUpFormView
      signInHref={signInHref}
      draft={draft}
      onSignedUp={(email, values) => {
        setDraft({ ...values, password: "" });
        setSentTo(email);
      }}
    />
  );
}

function SignUpFormView({
  signInHref,
  draft,
  onSignedUp,
}: {
  signInHref: string;
  draft?: Partial<SignUpFormValues>;
  onSignedUp: (email: string, values: SignUpFormValues) => void;
}) {
  return (
    <>
      <h1 className="mt-6 text-2xl font-bold text-foreground md:text-3xl">Create your account</h1>

      <div className="mt-8">
        <SignUpForm defaultValues={draft} onSignedUp={onSignedUp} />
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href={signInHref} className="text-foreground underline underline-offset-4 transition hover:text-brand-300">
          Already have an account? Sign in
        </Link>
      </p>
    </>
  );
}

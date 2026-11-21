"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LinkIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import FormAlert from "@/shared/ui/form/FormAlert";
import PasswordField from "@/shared/ui/form/PasswordField";
import { useResetPasswordMutation } from "../../api/authApi";
import { resetPasswordFailure } from "../../lib/authErrors";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../../schemas/auth.schema";

type Stage = "form" | "done" | { invalid: "missing" | "rejected" };

const linkClasses = "text-sm text-foreground underline underline-offset-4 transition hover:text-brand-300";

// Opened from the link in the password-reset email (/reset-password?token=…).
export default function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  // Read once: the token is taken out of the address bar straight after (see below).
  const [token] = useState(() => searchParams.get("token")?.trim() || null);
  const [stage, setStage] = useState<Stage>(token ? "form" : { invalid: "missing" });
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Keep the single-use token out of browser history, bookmarks and anything the address gets pasted into.
  useEffect(() => {
    if (token) window.history.replaceState(window.history.state, "", ROUTES.resetPassword);
  }, [token]);

  // A new screen replaced the form: move focus to its heading so screen readers announce it.
  useEffect(() => {
    if (stage !== "form") headingRef.current?.focus();
  }, [stage]);

  if (stage === "done") {
    return (
      <div className="mt-8 flex flex-col">
        <StatusIcon tone="success">
          <CircleCheck className="size-7" aria-hidden />
        </StatusIcon>
        <Heading ref={headingRef}>Password updated</Heading>
        <p className="mt-3 text-muted">Your new password is set. Sign in with it to pick up where you left off.</p>
        <Button href={ROUTES.signIn} size="lg" className="mt-8 w-full">
          Sign in
        </Button>
      </div>
    );
  }

  if (stage !== "form") {
    return (
      <div className="mt-8 flex flex-col">
        <StatusIcon tone="warning">
          <LinkIcon className="size-7" aria-hidden />
        </StatusIcon>
        <Heading ref={headingRef}>This link doesn&rsquo;t work</Heading>
        <p className="mt-3 text-muted">
          {stage.invalid === "missing"
            ? "The link is incomplete. Open it straight from the email, or request a new one."
            : "It may have expired or already been used. Request a new link and we'll email it to you."}
        </p>
        <Button href={ROUTES.forgotPassword} size="lg" className="mt-8 w-full">
          Request a new link
        </Button>
        <Link href={ROUTES.signIn} className={`mt-5 self-center ${linkClasses}`}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-6 text-2xl font-bold text-foreground md:text-3xl">Choose a new password</h1>
      <p className="mt-2 text-muted">Enter a new password for your account. You&rsquo;ll use it the next time you sign in.</p>
      <div className="mt-8">
        <ResetPasswordForm token={token!} onDone={() => setStage("done")} onLinkInvalid={() => setStage({ invalid: "rejected" })} />
      </div>
    </>
  );
}

interface ResetPasswordFormProps {
  token: string;
  onDone: () => void;
  onLinkInvalid: () => void;
}

function ResetPasswordForm({ token, onDone, onLinkInvalid }: ResetPasswordFormProps) {
  const [resetPassword] = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      await resetPassword({ token, password }).unwrap();
      onDone();
    } catch (error) {
      const failure = resetPasswordFailure(error);
      if (failure.kind === "link") onLinkInvalid();
      else if (failure.kind === "password") setError("password", { message: failure.message }, { shouldFocus: true });
      else setFormError(failure.message);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {formError && (
        <FormAlert>
          {formError}{" "}
          <Link href={ROUTES.forgotPassword} className="font-medium text-foreground underline underline-offset-4">
            Request a new link
          </Link>
        </FormAlert>
      )}

      <PasswordField
        id="password"
        label="New password"
        autoComplete="new-password"
        placeholder="Create a new password"
        hint="8 to 72 characters"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>

      <Link href={ROUTES.signIn} className={`mt-3 self-center ${linkClasses}`}>
        Back to sign in
      </Link>
    </form>
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

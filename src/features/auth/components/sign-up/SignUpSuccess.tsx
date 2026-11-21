"use client";

import { useEffect, useRef, useState } from "react";
import { MailCheck } from "lucide-react";
import { toApiError } from "@/lib/api/apiError";
import Button from "@/shared/ui/button/Button";
import { useResendVerificationMutation } from "../../api/authApi";

// How long before another verification email can be asked for.
const RESEND_COOLDOWN_SECONDS = 60;

interface SignUpSuccessProps {
  email: string;
  // Sign-in, carrying any ?redirectTo so the user lands where they started once verified.
  signInHref: string;
  onUseDifferentEmail: () => void;
}

// After sign-up: the account exists but isn't active until the emailed link is opened (no session yet).
export default function SignUpSuccess({ email, signInHref, onUseDifferentEmail }: SignUpSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [resendVerification, { isLoading: resending }] = useResendVerificationMutation();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendStatus, setResendStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // The form was replaced: move focus to the new heading so screen readers announce the result.
  useEffect(() => headingRef.current?.focus(), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    setResendStatus(null);
    try {
      await resendVerification({ email }).unwrap();
      setResendStatus({ tone: "ok", text: "We've sent another link. Check your inbox." });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const { status, code } = toApiError(error);
      setResendStatus({
        tone: "error",
        text:
          code === "network_error"
            ? "We couldn't reach GodsWheel. Check your connection and try again."
            : status === 429
              ? "Too many requests. Wait a few minutes, then try again."
              : "We couldn't send another link. Please try again.",
      });
    }
  };

  return (
    <div className="mt-8 flex flex-col">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <MailCheck className="size-7" aria-hidden />
      </span>

      <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-bold text-foreground focus:outline-none md:text-3xl">
        Check your email
      </h1>
      <p className="mt-3 text-muted">
        Your account is created. We&rsquo;ve sent a verification link to{" "}
        <span className="break-all font-medium text-foreground">{email}</span>. Open it to activate your account, then
        sign in.
      </p>

      <ol className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted">
        {["Open the email from GodsWheel", "Tap the verification link", "Sign in to save sermons and write notes"].map(
          (step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              {step}
            </li>
          )
        )}
      </ol>

      <Button href={signInHref} size="lg" className="mt-8 w-full">
        Go to sign in
      </Button>

      <div className="mt-6 text-center text-sm text-muted">
        <p>Didn&rsquo;t get it? Check your spam folder, or</p>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={cooldown > 0 || resending}
          className="mt-1 font-medium text-foreground underline underline-offset-4 transition hover:text-brand-300 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          {resending ? "Sending…" : cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
        </button>
        <p aria-live="polite" className={resendStatus?.tone === "error" ? "mt-2 text-danger" : "mt-2 text-success-500"}>
          {resendStatus?.text}
        </p>
      </div>

      <button
        type="button"
        onClick={onUseDifferentEmail}
        className="mt-4 self-center text-sm text-muted underline underline-offset-4 transition hover:text-foreground"
      >
        Wrong email? Use a different one
      </button>
    </div>
  );
}

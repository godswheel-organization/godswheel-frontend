"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/lib/routes";
import { generateDraftEncryptionKey } from "@/lib/security/sessionKey";
import Button from "@/shared/ui/button/Button";
import FormAlert from "@/shared/ui/form/FormAlert";
import PasswordField from "@/shared/ui/form/PasswordField";
import TextField from "@/shared/ui/form/TextField";
import { useResendVerificationMutation, useSignInMutation } from "../../api/authApi";
import { authErrorMessage, isUnverifiedSignIn } from "../../lib/authErrors";
import { safeRedirect } from "../../lib/safeRedirect";
import { signInSchema, type SignInFormValues } from "../../schemas/auth.schema";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signIn] = useSignInMutation();
  const [formError, setFormError] = useState<string | null>(null);
  // Set when sign-in was refused because the email isn't verified yet: offer to send the link again.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setUnverifiedEmail(null);
    try {
      await signIn(values).unwrap();
      // The per-session key that encrypts offline drafts in IndexedDB; nothing is stored locally until it exists.
      await generateDraftEncryptionKey();
      router.replace(safeRedirect(searchParams.get("redirectTo"), ROUTES.home));
    } catch (error) {
      setFormError(authErrorMessage(error, "signIn"));
      if (isUnverifiedSignIn(error)) setUnverifiedEmail(values.email);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {formError && (
        <FormAlert>
          {formError}
          {unverifiedEmail && <ResendVerification email={unverifiedEmail} />}
        </FormAlert>
      )}

      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Link
        href={ROUTES.forgotPassword}
        className="self-start text-sm text-foreground underline underline-offset-4 transition hover:text-brand-300"
      >
        Forgot password?
      </Link>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

// "Didn't get it?" for an unverified account, inside the sign-in error. The API answers the same whether or not
// the address needs verifying, so this can't be used to find out who has an account.
function ResendVerification({ email }: { email: string }) {
  const [resend, { isLoading, isSuccess, isError }] = useResendVerificationMutation();
  if (isSuccess) return <span className="mt-1 block text-foreground">We&rsquo;ve sent a new link to {email}.</span>;
  return (
    <button
      type="button"
      onClick={() => void resend({ email })}
      disabled={isLoading}
      className="mt-1 block font-medium text-foreground underline underline-offset-4 transition hover:text-brand-300 disabled:opacity-60"
    >
      {isLoading ? "Sending…" : isError ? "Couldn't send. Try again" : "Resend verification email"}
    </button>
  );
}

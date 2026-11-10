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
import { useSignInMutation } from "../../api/authApi";
import { authErrorMessage } from "../../lib/authErrors";
import { safeRedirect } from "../../lib/safeRedirect";
import { signInSchema, type SignInFormValues } from "../../schemas/auth.schema";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signIn] = useSignInMutation();
  const [formError, setFormError] = useState<string | null>(null);

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
    try {
      await signIn(values).unwrap();
      // The per-session key that encrypts offline drafts in IndexedDB; nothing is stored locally until it exists.
      await generateDraftEncryptionKey();
      router.replace(safeRedirect(searchParams.get("redirectTo"), ROUTES.home));
    } catch (error) {
      setFormError(authErrorMessage(error, "signIn"));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {formError && <FormAlert>{formError}</FormAlert>}

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

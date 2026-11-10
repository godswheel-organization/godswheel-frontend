"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import FormAlert from "@/shared/ui/form/FormAlert";
import TextField from "@/shared/ui/form/TextField";
import { useRequestPasswordResetMutation } from "../../api/authApi";
import { passwordResetErrorMessage } from "../../lib/authErrors";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../schemas/auth.schema";

const linkClasses = "text-sm text-foreground underline underline-offset-4 transition hover:text-brand-300";

export default function ForgotPasswordForm() {
  const [requestReset] = useRequestPasswordResetMutation();
  const [formError, setFormError] = useState<string | null>(null);
  // The address the link went to, once sent. The message is the same whether or not it has an account.
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await requestReset({ email }).unwrap();
      setSentTo(email);
    } catch (error) {
      const message = passwordResetErrorMessage(error);
      if (message) setFormError(message);
      else setSentTo(email);
    }
  });

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-start gap-5">
        <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-lg font-semibold text-foreground">Check your email</p>
          <p className="mt-2 text-muted">
            If there&rsquo;s an account for <span className="font-medium text-foreground">{sentTo}</span>, we&rsquo;ve
            sent it a link to reset your password. It can take a few minutes to arrive.
          </p>
        </div>
        <Button href={ROUTES.signIn} size="lg" className="w-full">
          Back to sign in
        </Button>
        <button
          type="button"
          onClick={() => {
            reset({ email: sentTo });
            setSentTo(null);
          }}
          className={`self-center ${linkClasses}`}
        >
          Use a different email
        </button>
      </div>
    );
  }

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

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>

      <Link href={ROUTES.signIn} className={`mt-3 self-center ${linkClasses}`}>
        Back to sign in
      </Link>
    </form>
  );
}

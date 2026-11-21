"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toApiError } from "@/lib/api/apiError";
import Button from "@/shared/ui/button/Button";
import FormAlert from "@/shared/ui/form/FormAlert";
import TextField from "@/shared/ui/form/TextField";
import { useResendVerificationMutation } from "../../api/authApi";
import { resendVerificationSchema, type ResendVerificationFormValues } from "../../schemas/auth.schema";

// Sends a fresh verification link. The API answers the same whether or not the address needs one, so the
// confirmation says "if", and nobody can use this to find out who has an account.
export default function ResendVerificationForm({ className }: { className?: string }) {
  const [resend] = useResendVerificationMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await resend({ email }).unwrap();
      setSentTo(email);
    } catch (error) {
      const { status, code } = toApiError(error);
      setFormError(
        code === "network_error"
          ? "We couldn't reach GodsWheel. Check your connection and try again."
          : status === 429
            ? "Too many requests. Wait a few minutes, then try again."
            : "We couldn't send a new link. Please try again."
      );
    }
  });

  if (sentTo) {
    return (
      <p role="status" className={`text-sm text-muted ${className ?? ""}`}>
        If <span className="break-all font-medium text-foreground">{sentTo}</span> still needs verifying, a new link is on
        its way. It can take a few minutes to arrive.
      </p>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={`flex flex-col gap-4 ${className ?? ""}`}>
      {formError && <FormAlert>{formError}</FormAlert>}
      <TextField
        id="resend-email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" variant="secondary" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending…" : "Send a new link"}
      </Button>
    </form>
  );
}

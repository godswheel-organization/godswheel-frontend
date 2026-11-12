"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/lib/routes";
import { generateDraftEncryptionKey } from "@/lib/security/sessionKey";
import Button from "@/shared/ui/button/Button";
import CheckboxField from "@/shared/ui/form/CheckboxField";
import FormAlert from "@/shared/ui/form/FormAlert";
import PasswordField from "@/shared/ui/form/PasswordField";
import TextField from "@/shared/ui/form/TextField";
import { useSignUpMutation } from "../../api/authApi";
import { authErrorMessage } from "../../lib/authErrors";
import { safeRedirect } from "../../lib/safeRedirect";
import { signUpSchema, type SignUpFormValues } from "../../schemas/auth.schema";

const inlineLinkClasses = "underline underline-offset-4 transition hover:text-brand-300";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signUp] = useSignUpMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", termsAccepted: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // The schema only lets this run once the box is ticked; the API wants the literal `true`.
      await signUp({ ...values, termsAccepted: true }).unwrap();
      await generateDraftEncryptionKey();
      router.replace(safeRedirect(searchParams.get("redirectTo"), ROUTES.home));
    } catch (error) {
      setFormError(authErrorMessage(error, "signUp"));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="firstName"
          label="First name"
          autoComplete="given-name"
          placeholder="First name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextField
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          placeholder="Last name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
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
        autoComplete="new-password"
        placeholder="Create a password"
        hint="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <CheckboxField
        id="termsAccepted"
        error={errors.termsAccepted?.message}
        label={
          <>
            I agree to the{" "}
            <Link href={ROUTES.terms} className={inlineLinkClasses}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href={ROUTES.privacy} className={inlineLinkClasses}>
              Privacy notice
            </Link>
          </>
        }
        {...register("termsAccepted")}
      />

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

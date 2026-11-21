"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/lib/routes";
import Button from "@/shared/ui/button/Button";
import CheckboxField from "@/shared/ui/form/CheckboxField";
import FormAlert from "@/shared/ui/form/FormAlert";
import PasswordField from "@/shared/ui/form/PasswordField";
import TextField from "@/shared/ui/form/TextField";
import { useSignUpMutation } from "../../api/authApi";
import { signUpErrors, type SignUpField } from "../../lib/authErrors";
import { signUpSchema, toFullName, type SignUpFormValues } from "../../schemas/auth.schema";

const inlineLinkClasses = "underline underline-offset-4 transition hover:text-brand-300";

interface SignUpFormProps {
  // Values to start from (coming back from "Use a different email").
  defaultValues?: Partial<SignUpFormValues>;
  // The account was created: the API has emailed a verification link to this address.
  onSignedUp: (email: string, values: SignUpFormValues) => void;
}

export default function SignUpForm({ defaultValues, onSignedUp }: SignUpFormProps) {
  const [signUp] = useSignUpMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", termsAccepted: false, ...defaultValues },
  });

  // Back from "Use a different email": straight to the email field to fix it.
  useEffect(() => {
    if (defaultValues?.email) setFocus("email", { shouldSelect: true });
  }, [defaultValues?.email, setFocus]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await signUp({
        full_name: toFullName(values.firstName, values.lastName),
        email: values.email,
        password: values.password,
        // The schema only lets this run once the box is ticked; the API wants the literal `true`.
        accepted_terms: true,
      }).unwrap();
      onSignedUp(user.email || values.email, values);
    } catch (error) {
      const { fields, form } = signUpErrors(error);
      const entries = Object.entries(fields) as [SignUpField, string][];
      entries.forEach(([field, message], index) => setError(field, { message }, { shouldFocus: index === 0 }));
      if (form) setFormError(form);
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

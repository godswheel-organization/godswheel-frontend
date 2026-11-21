"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import FormAlert from "@/shared/ui/form/FormAlert";
import PasswordField from "@/shared/ui/form/PasswordField";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";
import { useChangePasswordMutation } from "../../api/authApi";
import { useSession } from "../../hooks/useSession";
import { changePasswordErrorMessage } from "../../lib/authErrors";
import { changePasswordSchema, type ChangePasswordFormValues } from "../../schemas/auth.schema";
import SignInGate from "../account-prompt/SignInGate";

// Settings → Change password.
export default function ChangePasswordScreen() {
  const { isSignedIn, isLoading } = useSession();

  return (
    <Container className="py-4 md:py-8">
      <div className="mx-auto max-w-xl">
        <PageHeader title="Change password" backHref={ROUTES.settings} variant="compact" />
        {isLoading ? (
          <FormSkeleton />
        ) : isSignedIn ? (
          <ChangePasswordForm />
        ) : (
          <div className="mt-6">
            <SignInGate kind="account" />
          </div>
        )}
      </div>
    </Container>
  );
}

function ChangePasswordForm() {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await changePassword(values).unwrap();
      // The API keeps this session and revokes every other one.
      toast.success("Password updated. You've been signed out on your other devices.");
      router.push(ROUTES.settings);
    } catch (error) {
      const { field, message } = changePasswordErrorMessage(error);
      if (field) setError(field, { message }, { shouldFocus: true });
      else setFormError(message);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
      <p className="text-muted">Choose a new password that you have not used before.</p>
      {formError && <FormAlert>{formError}</FormAlert>}

      <PasswordField
        id="currentPassword"
        label="Current password"
        autoComplete="current-password"
        placeholder="Enter your current password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <PasswordField
        id="newPassword"
        label="New password"
        autoComplete="new-password"
        placeholder="Create a new password"
        hint="At least 8 characters"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>

      <Link
        href={ROUTES.forgotPassword}
        className="mx-auto mt-2 text-sm text-muted underline underline-offset-4 transition hover:text-foreground"
      >
        Forgot your password?
      </Link>
    </form>
  );
}

function FormSkeleton() {
  return (
    <SkeletonGroup label="Loading" className="mt-8 flex flex-col gap-5">
      <Skeleton className="h-4 w-4/5" />
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="mt-1 h-12 w-full rounded-xl" />
    </SkeletonGroup>
  );
}

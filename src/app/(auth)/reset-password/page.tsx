import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordScreen from "@/features/auth/components/reset-password/ResetPasswordScreen";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import Logo from "@/shared/ui/brand/Logo";
import BackButton from "@/shared/ui/button/BackButton";

export const metadata: Metadata = pageMetadata({ title: "Choose a new password", noIndex: true });

// The password-reset email links here: /reset-password?token=… (see emails/reset-password.html).
export default function ResetPasswordPage() {
  return (
    <>
      <BackButton icon="back" label="Go back" fallbackHref={ROUTES.signIn} />
      <Logo className="mt-8" />
      {/* Reads ?token from the URL, hence Suspense. */}
      <Suspense>
        <ResetPasswordScreen />
      </Suspense>
    </>
  );
}

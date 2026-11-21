import { Suspense } from "react";
import type { Metadata } from "next";
import SignUpScreen from "@/features/auth/components/sign-up/SignUpScreen";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import BackButton from "@/shared/ui/button/BackButton";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({ title: "Create account", noIndex: true });

export default function SignUpPage() {
  return (
    <>
      <BackButton icon="back" label="Go back" fallbackHref={ROUTES.signIn} />
      <Logo className="mt-8" />

      {/* The form, then "Check your email" once the account is created. Reads ?redirectTo, hence Suspense. */}
      <Suspense>
        <SignUpScreen />
      </Suspense>
    </>
  );
}

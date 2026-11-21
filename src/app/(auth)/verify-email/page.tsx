import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyEmailScreen from "@/features/auth/components/verify-email/VerifyEmailScreen";
import { pageMetadata } from "@/lib/seo/metadata";
import Logo from "@/shared/ui/brand/Logo";

export const metadata: Metadata = pageMetadata({ title: "Verify your email", noIndex: true });

// The verification email links here: /verify-email?token=…
// TODO(backend): confirm the email's link uses this path and a `token` query parameter.
export default function VerifyEmailPage() {
  return (
    <>
      <Logo />
      {/* Reads ?token from the URL, hence Suspense. */}
      <Suspense>
        <VerifyEmailScreen />
      </Suspense>
    </>
  );
}

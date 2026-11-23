import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/features/auth/components/sign-in/SignInForm";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import BackButton from "@/shared/ui/button/BackButton";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  noIndex: true,
});

const footerLinkClasses =
  "text-foreground underline underline-offset-4 transition hover:text-brand-300";

export default function SignInPage() {
  return (
    <>
      <BackButton
        icon="close"
        label="Close sign in"
        fallbackHref={ROUTES.home}
      />
      <Logo className="mt-8" />

      <h1 className="mt-6 text-2xl font-bold text-foreground md:text-3xl">
        Welcome back
      </h1>
      <p className="mt-2 text-muted">
        Sign in to save sermons and pick up where you stopped.
      </p>

      <div className="mt-8">
        {/* The form reads ?redirectTo=, which Next requires to sit under a Suspense boundary. */}
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5 text-sm">
        <Link href={ROUTES.signUp} className={footerLinkClasses}>
          New here? Create account
        </Link>
        <Link href={ROUTES.home} className={footerLinkClasses}>
          Continue browsing without an account
        </Link>
      </div>
    </>
  );
}

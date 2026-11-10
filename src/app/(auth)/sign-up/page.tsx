import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "@/features/auth/components/sign-up/SignUpForm";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import BackButton from "@/shared/ui/button/BackButton";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <BackButton icon="back" label="Go back" fallbackHref={ROUTES.signIn} />
      <Logo className="mt-8" />

      <h1 className="mt-6 text-3xl font-bold text-foreground">Create your account</h1>

      <div className="mt-8">
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href={ROUTES.signIn} className="text-foreground underline underline-offset-4 transition hover:text-brand-300">
          Already have an account? Sign in
        </Link>
      </p>
    </>
  );
}

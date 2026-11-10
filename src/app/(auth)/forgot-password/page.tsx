import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/auth/components/forgot-password/ForgotPasswordForm";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import BackButton from "@/shared/ui/button/BackButton";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <BackButton icon="back" label="Go back" fallbackHref={ROUTES.signIn} />
      <Logo className="mt-8" />

      <h1 className="mt-6 text-3xl font-bold text-foreground">Reset your password</h1>
      <p className="mt-2 text-muted">Enter your email and we&rsquo;ll send you a link to choose a new one.</p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}

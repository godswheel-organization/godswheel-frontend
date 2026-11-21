"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import { useSession } from "../hooks/useSession";

const pill = "rounded-full px-5 py-2.5";

// The landing page header's buttons. Guests get Sign in (plus Create account from md up); a signed-in visitor
// sees that they're signed in, with a way back into the app.
export default function SiteHeaderActions() {
  const { session, isLoading } = useSession();

  if (session) {
    const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
    return (
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.home}
          aria-label={`Signed in as ${session.firstName} ${session.lastName}. Open GodsWheel`}
          className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-4 text-sm font-medium text-foreground transition hover:bg-surface"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-on-brand">
            {initials}
          </span>
          Signed in
        </Link>
        <Button
          href={ROUTES.home}
          size="sm"
          endIcon={<ArrowRight className="size-4" aria-hidden />}
          className={cn(pill, "hidden md:inline-flex")}
        >
          Open app
        </Button>
      </div>
    );
  }

  // While the session is being checked the guest buttons hold their place unseen, so a signed-in visitor
  // doesn't see "Sign in" flash first. They're still in the HTML for crawlers.
  return (
    <div className={cn("flex items-center gap-3", isLoading && "invisible")}>
      <Button href={ROUTES.signIn} variant="outline" size="sm" className={pill}>
        Sign in
      </Button>
      <Button href={ROUTES.signUp} size="sm" className={cn(pill, "hidden md:inline-flex")}>
        Create account
      </Button>
    </div>
  );
}

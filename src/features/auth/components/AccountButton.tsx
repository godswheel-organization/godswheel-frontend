"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, signInThenReturnTo } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import { useSession } from "../hooks/useSession";

interface AccountButtonProps {
  // The sidebar wants a full-width control; the phone top bar a compact one.
  fullWidth?: boolean;
}

// "Sign in" for guests (returning to this page afterwards); the user's initials, linking to settings, once signed in.
export default function AccountButton({ fullWidth = false }: AccountButtonProps) {
  const pathname = usePathname();
  const { session } = useSession();

  if (session) {
    const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
    return (
      <Link
        href={ROUTES.settings}
        aria-label={`Account settings for ${session.firstName} ${session.lastName}`}
        className={cn("flex items-center gap-3 font-medium text-foreground", fullWidth && "w-full")}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-on-brand">
          {initials}
        </span>
        {fullWidth && <span className="truncate">{session.firstName}</span>}
      </Link>
    );
  }

  return (
    <Button
      href={signInThenReturnTo(pathname)}
      variant="outline"
      size="sm"
      className={cn("rounded-full px-5 py-2.5", fullWidth && "w-full")}
    >
      Sign in
    </Button>
  );
}

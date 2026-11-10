"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { ROUTES, signInThenReturnTo } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { useNavPanelVariant } from "@/shared/layouts/app-nav/AppNavProvider";
import Button from "@/shared/ui/button/Button";
import { useSession } from "../hooks/useSession";

// "Sign in" for guests (returning to this page afterwards); the user's initials, linking to settings, once signed in.
// Sizes itself to where it sits: compact in the phone top bar, full width in the sidebar and menu drawer,
// an icon over a small label on the collapsed sidebar rail.
export default function AccountButton() {
  const pathname = usePathname();
  const { session } = useSession();
  const variant = useNavPanelVariant();

  if (session) {
    const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
    return (
      <Link
        href={ROUTES.settings}
        aria-label={`Account settings for ${session.firstName} ${session.lastName}`}
        className={cn("flex items-center gap-3 font-medium text-foreground", variant === "full" && "w-full")}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-brand-500 font-semibold text-on-brand",
            variant === null ? "size-9 text-xs" : "size-11 text-sm"
          )}
        >
          {initials}
        </span>
        {variant === "full" && <span className="truncate">{session.firstName}</span>}
      </Link>
    );
  }

  if (variant === "rail") {
    return (
      <Link
        href={signInThenReturnTo(pathname)}
        className="flex w-full flex-col items-center gap-1 rounded-xl py-3 text-[11px] font-medium text-muted transition hover:bg-surface/60 hover:text-foreground"
      >
        <UserRound className="size-6" strokeWidth={1.75} aria-hidden />
        Sign in
      </Link>
    );
  }

  return (
    <Button
      href={signInThenReturnTo(pathname)}
      variant="outline"
      size="sm"
      className={cn("rounded-full", variant === "full" ? "w-full px-5 py-2.5" : "px-4 py-2")}
    >
      Sign in
    </Button>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface ChipProps {
  href: string;
  active?: boolean;
  // false keeps the scroll position, for chips that only change the current page's filters.
  scroll?: boolean;
  children: ReactNode;
}

// A pill-shaped filter link. Active = filled brand orange.
export default function Chip({ href, active = false, scroll, children }: ChipProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-5 py-2.5 text-base transition",
        active
          ? "border-brand-500 bg-brand-500 font-medium text-on-brand"
          : "border-border text-foreground hover:border-brand-500/50 hover:bg-surface"
      )}
    >
      {children}
    </Link>
  );
}

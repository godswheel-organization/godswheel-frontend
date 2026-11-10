"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import Logo from "@/shared/ui/brand/Logo";
import { APP_NAV, isNavItemActive } from "./appNav";

interface SideNavProps {
  // Pinned to the bottom of the sidebar (the account / sign-in control).
  footer?: ReactNode;
}

export default function SideNav({ footer }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-background px-4 py-6 md:flex">
      <Logo href={ROUTES.home} className="px-3" />

      <nav aria-label="Main" className="mt-10">
        <ul className="flex flex-col gap-1">
          {APP_NAV.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition",
                    active ? "bg-surface text-brand-500" : "text-muted hover:bg-surface/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && <div className="mt-auto px-3">{footer}</div>}
    </aside>
  );
}

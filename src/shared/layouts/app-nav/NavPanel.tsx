"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NavPanelVariantContext, type NavPanelVariant } from "./AppNavProvider";
import { APP_NAV, isNavItemActive } from "./appNav";

export interface NavPanelProps {
  // Sections under the main tabs, passed in by the app layout (Explore topics, the verse card).
  extras?: ReactNode;
  // Pinned to the bottom (the account / sign-in control).
  footer?: ReactNode;
}

// What both the desktop sidebar and the phone menu drawer list: the tabs, then the extras, then the account.
// As an icon rail (collapsed sidebar), each tab is an icon over a small label and the extras are left out.
export default function NavPanel({ extras, footer, variant = "full" }: NavPanelProps & { variant?: NavPanelVariant }) {
  const pathname = usePathname();
  const rail = variant === "rail";

  return (
    <NavPanelVariantContext.Provider value={variant}>
      <nav aria-label="Main" className={rail ? "mt-6" : "mt-8"}>
        <ul className={cn("flex flex-col", rail ? "gap-2" : "gap-1")}>
          {APP_NAV.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-xl font-medium transition",
                    rail ? "flex flex-col items-center gap-1 py-3 text-[11px]" : "flex items-center gap-3 px-3 py-2.5",
                    active ? "bg-surface text-brand-500" : "text-muted hover:bg-surface/60 hover:text-foreground"
                  )}
                >
                  <Icon className={rail ? "size-6" : "size-5"} strokeWidth={1.75} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {extras && !rail && <div className="mt-5 border-t border-border pt-5">{extras}</div>}

      {footer && (
        // Pinned to the bottom: on short screens the sections above scroll under it, so it never leaves view.
        <div className={cn("sticky bottom-0 mt-auto bg-background pb-6 pt-4", rail ? "flex justify-center" : "px-3")}>{footer}</div>
      )}
    </NavPanelVariantContext.Provider>
  );
}

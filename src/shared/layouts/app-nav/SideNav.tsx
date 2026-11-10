"use client";

import { Menu } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import Logo from "@/shared/ui/brand/Logo";
import { useAppNav } from "./AppNavProvider";
import NavPanel, { type NavPanelProps } from "./NavPanel";

// The desktop sidebar (md and up). ☰ shrinks it to an icon rail and back, as YouTube does; on phones the same
// panel opens as a drawer instead (NavDrawer).
export default function SideNav(props: NavPanelProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppNav();

  return (
    <aside
      className={cn(
        "no-scrollbar sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-border bg-background pt-4 md:flex",
        sidebarCollapsed ? "px-2" : "px-4"
      )}
    >
      <div className={cn("flex h-12 items-center gap-2", sidebarCollapsed && "justify-center")}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          <Menu className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
        {!sidebarCollapsed && <Logo href={ROUTES.home} />}
      </div>
      <NavPanel {...props} variant={sidebarCollapsed ? "rail" : "full"} />
    </aside>
  );
}

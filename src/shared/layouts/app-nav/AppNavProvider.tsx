"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SIDEBAR_COOKIE, SIDEBAR_COOKIE_MAX_AGE } from "./sidebarCookie";

interface AppNavState {
  // Phones: the ☰ menu drawer.
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  // md and up: the sidebar shrunk to an icon rail.
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppNavContext = createContext<AppNavState | null>(null);

export function useAppNav(): AppNavState {
  const context = useContext(AppNavContext);
  if (!context) throw new Error("useAppNav must be used inside <AppNavProvider> (the app shell provides it).");
  return context;
}

interface AppNavProviderProps {
  initialSidebarCollapsed: boolean;
  className?: string;
  children: ReactNode;
}

// Renders the shell's root element: data-sidebar="collapsed|expanded" lets anything inside size itself
// to the sidebar with `group-data-[sidebar=collapsed]/shell:` (e.g. the mini player's left edge).
export function AppNavProvider({ initialSidebarCollapsed, className, children }: AppNavProviderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);

  const value = useMemo<AppNavState>(
    () => ({
      drawerOpen,
      setDrawerOpen,
      sidebarCollapsed,
      toggleSidebar: () => {
        const next = !sidebarCollapsed;
        setSidebarCollapsed(next);
        document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; Path=/; Max-Age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
      },
    }),
    [drawerOpen, sidebarCollapsed]
  );

  return (
    <AppNavContext.Provider value={value}>
      <div data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"} className={cn("group/shell", className)}>
        {children}
      </div>
    </AppNavContext.Provider>
  );
}

// Which way a NavPanel is drawn: the full list (expanded sidebar, phone drawer) or the icon rail.
// Components passed into the panel (e.g. the account button) read it to size themselves;
// null means they're not in a panel at all (e.g. the phone top bar).
export type NavPanelVariant = "full" | "rail";
export const NavPanelVariantContext = createContext<NavPanelVariant | null>(null);
export const useNavPanelVariant = () => useContext(NavPanelVariantContext);

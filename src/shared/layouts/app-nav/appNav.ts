import { Compass, House, Library, Search, Settings, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// The app's five tabs: the bottom bar on phones, the sidebar from md up.
export const APP_NAV: AppNavItem[] = [
  { label: "Home", href: ROUTES.home, icon: House },
  { label: "Browse", href: ROUTES.sermons, icon: Compass },
  { label: "Search", href: ROUTES.search, icon: Search },
  { label: "Library", href: ROUTES.library, icon: Library },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
];

// A tab is active on its own page and anything under it (Browse stays lit on /sermons/<id>).
export function isNavItemActive(item: AppNavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

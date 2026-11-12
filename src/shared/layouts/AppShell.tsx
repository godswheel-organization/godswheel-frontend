import type { ReactNode } from "react";
import { AppNavProvider } from "./app-nav/AppNavProvider";
import BottomNav from "./app-nav/BottomNav";
import NavDrawer from "./app-nav/NavDrawer";
import SideNav from "./app-nav/SideNav";
import AppTopBar from "./AppTopBar";

interface AppShellProps {
  children: ReactNode;
  // Feature-owned pieces, passed in so shared/ never imports from features/.
  account: ReactNode;
  // Extra sidebar / menu-drawer sections (below the main tabs).
  sidebarExtras?: ReactNode;
  player: ReactNode;
  // Rendered outside the page flow: full-screen player, app-wide sheets, the playback engine.
  overlays?: ReactNode;
  // From the sidebar cookie, so the first render already has the right width.
  sidebarCollapsed: boolean;
}

// The app frame. Phones: a top bar (☰ opens a drawer with the sidebar's contents) and bottom tabs.
// md and up: a sidebar that ☰ shrinks to an icon rail. The mini player sits above whichever applies.
export default function AppShell({ children, account, sidebarExtras, player, overlays, sidebarCollapsed }: AppShellProps) {
  return (
    <AppNavProvider
      initialSidebarCollapsed={sidebarCollapsed}
      className="min-h-dvh md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:transition-[grid-template-columns] md:duration-200 md:data-[sidebar=collapsed]:grid-cols-[5rem_minmax(0,1fr)]"
    >
      <SideNav extras={sidebarExtras} footer={account} />

      {/* Bottom padding keeps the last item clear of the fixed bottom tabs on phones. */}
      <div className="flex min-h-dvh min-w-0 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <AppTopBar actions={account} />
        <main className="flex-1">{children}</main>
        {player}
      </div>

      <BottomNav />
      <NavDrawer extras={sidebarExtras} footer={account} />
      {overlays}
    </AppNavProvider>
  );
}

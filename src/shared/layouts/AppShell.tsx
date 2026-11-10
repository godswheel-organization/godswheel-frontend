import type { ReactNode } from "react";
import BottomNav from "./app-nav/BottomNav";
import SideNav from "./app-nav/SideNav";

interface AppShellProps {
  children: ReactNode;
  // Feature-owned pieces, passed in so shared/ never imports from features/.
  account: ReactNode;
  player: ReactNode;
  // Rendered outside the page flow: full-screen player, app-wide sheets, the playback engine.
  overlays?: ReactNode;
}

// The signed-in-or-guest app frame: sidebar from md up, bottom tabs on phones, mini player above both.
export default function AppShell({ children, account, player, overlays }: AppShellProps) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <SideNav footer={account} />

      {/* Bottom padding keeps the last item clear of the fixed bottom tabs on phones. */}
      <div className="flex min-h-dvh min-w-0 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="flex-1">{children}</main>
        {player}
      </div>

      <BottomNav />
      {overlays}
    </div>
  );
}

import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import AccountButton from "@/features/auth/components/AccountButton";
import AccountPromptSheet from "@/features/auth/components/account-prompt/AccountPromptSheet";
import VerseCard from "@/features/bible/components/VerseCard";
import FullPlayer from "@/features/player/components/FullPlayer";
import MiniPlayer from "@/features/player/components/MiniPlayer";
import PlaybackEngine from "@/features/player/components/PlaybackEngine";
import ExploreNav from "@/features/sermons/components/ExploreNav";
import AppShell from "@/shared/layouts/AppShell";
import { SIDEBAR_COOKIE } from "@/shared/layouts/app-nav/sidebarCookie";
import PwaRegister from "@/shared/pwa/PwaRegister";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sidebarCollapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <>
      <PwaRegister />
      <AppShell
        sidebarCollapsed={sidebarCollapsed}
        account={<AccountButton />}
        sidebarExtras={
          <div className="flex flex-col gap-6">
            {/* ExploreNav reads ?topic= to light the current topic, which Next requires to sit under Suspense. */}
            <Suspense>
              <ExploreNav />
            </Suspense>
            <VerseCard />
          </div>
        }
        player={<MiniPlayer />}
        overlays={
          <>
            <PlaybackEngine />
            <FullPlayer />
            <AccountPromptSheet />
          </>
        }
      >
        {children}
      </AppShell>
    </>
  );
}

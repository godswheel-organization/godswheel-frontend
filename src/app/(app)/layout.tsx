import type { ReactNode } from "react";
import AccountButton from "@/features/auth/components/AccountButton";
import AccountPromptSheet from "@/features/auth/components/account-prompt/AccountPromptSheet";
import FullPlayer from "@/features/player/components/FullPlayer";
import MiniPlayer from "@/features/player/components/MiniPlayer";
import PlaybackEngine from "@/features/player/components/PlaybackEngine";
import AppShell from "@/shared/layouts/AppShell";
import PwaRegister from "@/shared/pwa/PwaRegister";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaRegister />
      <AppShell
        account={<AccountButton fullWidth />}
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

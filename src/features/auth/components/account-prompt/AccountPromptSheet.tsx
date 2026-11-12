"use client";

import { setExpanded } from "@/features/player/store/playerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import Sheet, { SheetTitle } from "@/shared/ui/modal/Sheet";
import { closeAccountPrompt } from "../../store/accountPromptSlice";
import AccountPromptContent from "./AccountPromptContent";

// The app's single "Create an account to …" sheet, opened from anywhere with dispatch(openAccountPrompt(reason)).
// Mounted once in the app layout.
export default function AccountPromptSheet() {
  const dispatch = useAppDispatch();
  const reason = useAppSelector((state) => state.accountPrompt.reason);
  const close = () => dispatch(closeAccountPrompt());

  return (
    <Sheet open={reason !== null} onOpenChange={(open) => !open && close()}>
      {reason && (
        <AccountPromptContent
          kind={reason}
          returnTo={`${window.location.pathname}${window.location.search}`}
          titleAs={SheetTitle}
          className="pt-6"
          onDismiss={close}
          onNavigate={() => {
            close();
            // Leaving for sign-in: don't come back to the full-screen player still covering the page.
            dispatch(setExpanded(false));
          }}
        />
      )}
    </Sheet>
  );
}

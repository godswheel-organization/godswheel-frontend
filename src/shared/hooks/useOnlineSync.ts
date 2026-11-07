import { useEffect } from "react";
import { flushUnsyncedDrafts } from "@/lib/offline/draftSyncQueue";
import type { DraftId } from "@/lib/offline/draftDb";

// Foreground-only reconnect sync — see lib/offline/draftSyncQueue.ts for why.
// saveDraft is usually an RTK Query mutation's `.unwrap()`; keep it stable (useCallback) to avoid re-subscribing.
export function useOnlineSync(saveDraft: (id: DraftId, data: unknown) => Promise<void>) {
  useEffect(() => {
    const handleOnline = () => {
      void flushUnsyncedDrafts(saveDraft);
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) handleOnline();

    return () => window.removeEventListener("online", handleOnline);
  }, [saveDraft]);
}

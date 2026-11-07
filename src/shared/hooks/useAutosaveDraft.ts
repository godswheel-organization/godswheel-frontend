import { useEffect, useRef } from "react";
import { saveDraftLocally, type DraftId } from "@/lib/offline/draftDb";

const DEBOUNCE_MS = 600;

// Debounces form changes before writing an encrypted draft to IndexedDB.
export function useAutosaveDraft(id: DraftId, data: unknown) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // undefined means "don't autosave yet" (e.g. a read-only render) — never persisted.
    if (data === undefined) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Drafts can't be encrypted until sign-in establishes the session key.
      void saveDraftLocally(id, data).catch(() => undefined);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [id, data]);
}

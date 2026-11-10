import { authApi } from "@/features/auth/api/authApi";
import { libraryApi } from "@/features/library/api/libraryApi";
import { notesApi } from "@/features/notes/api/notesApi";
import { closePlayer } from "@/features/player/store/playerSlice";
import { settingsApi } from "@/features/settings/api/settingsApi";
import { clearDraftsLocally } from "@/lib/offline/draftDb";
import { clearSessionKeyMaterial } from "@/lib/security/sessionKey";
import type { AppDispatch } from "./index";

// Clears per-user caches on sign-out/session loss, so the next person on this device sees none of it.
// Resetting authApi re-runs the session check, which then answers "signed out".
// sermonsApi and bibleApi are public data, so they survive.
export function clearUserData(dispatch: AppDispatch) {
  dispatch(libraryApi.util.resetApiState());
  dispatch(notesApi.util.resetApiState());
  dispatch(settingsApi.util.resetApiState());
  dispatch(authApi.util.resetApiState());
  dispatch(closePlayer());
  clearSessionKeyMaterial();
  void clearDraftsLocally().catch(() => undefined);
}

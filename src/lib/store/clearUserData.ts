import { clearDraftsLocally } from "@/lib/offline/draftDb";
import { clearSessionKeyMaterial } from "@/lib/security/sessionKey";
import type { AppDispatch } from "./index";

// Clears per-user caches on sign-out/session loss. Skips authApi: resetting it re-runs the session check.
export function clearUserData(dispatch: AppDispatch) {
  // As feature api slices are added, reset each one here: dispatch(featureApi.util.resetApiState()).
  void dispatch;
  clearSessionKeyMaterial();
  void clearDraftsLocally().catch(() => undefined);
}

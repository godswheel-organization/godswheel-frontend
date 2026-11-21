import { useHydrated } from "@/shared/hooks/useHydrated";
import { useGetSessionQuery } from "../api/authApi";

// Who's signed in. RTK Query keeps the last good `data` even after a later check fails, so a failed
// re-check (e.g. after sign-out) must count as signed out rather than showing the old user.
// The server can't know the session (it lives in this browser), so it renders "loading"; until hydration is done
// the browser says "loading" too, even if it already knows (a guest's check finishes instantly), or React would
// find the server's HTML doesn't match.
export function useSession() {
  const hydrated = useHydrated();
  const { data, isError, isLoading } = useGetSessionQuery();
  if (!hydrated) return { session: undefined, isSignedIn: false, isLoading: true };
  const session = isError ? undefined : (data ?? undefined);
  return { session, isSignedIn: Boolean(session), isLoading };
}

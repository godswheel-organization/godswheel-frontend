import { useGetSessionQuery } from "../api/authApi";

// Who's signed in. RTK Query keeps the last good `data` even after a later check fails, so a failed
// re-check (e.g. after sign-out) must count as signed out rather than showing the old user.
export function useSession() {
  const { data, isError, isLoading } = useGetSessionQuery();
  const session = isError ? undefined : data;
  return { session, isSignedIn: Boolean(session), isLoading };
}

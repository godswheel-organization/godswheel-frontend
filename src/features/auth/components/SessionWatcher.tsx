"use client";

import { useEffect } from "react";
import { API_TAGS } from "@/lib/api/apiTags";
import { SESSION_STORAGE_KEY } from "@/lib/api/auth/accessToken";
import { UNAUTHORIZED_EVENT } from "@/lib/api/baseQuery";
import { useAppDispatch } from "@/lib/store";
import { clearUserData } from "@/lib/store/clearUserData";
import { authApi } from "../api/authApi";

const userIdIn = (raw: string | null) => {
  try {
    return raw ? ((JSON.parse(raw) as { user?: { id?: string } }).user?.id ?? null) : null;
  } catch {
    return null;
  }
};

// Keeps every screen, and every open tab, agreeing on who's signed in.
// - A call answered 401 (the API may have revoked the token, e.g. after a password change on another device):
//   re-check with GET /auth/me, which signs this device out only if the API confirms it.
// - Signing in or out in another tab: follow it here. A different person (or nobody) means this tab's
//   per-user data goes too.
export default function SessionWatcher() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const recheck = () => dispatch(authApi.util.invalidateTags([API_TAGS.Auth]));
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_STORAGE_KEY && event.key !== null) return;
      const before = userIdIn(event.oldValue);
      const after = userIdIn(event.newValue);
      if (event.key === null || before !== after) clearUserData(dispatch);
      else recheck();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, recheck);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, recheck);
      window.removeEventListener("storage", onStorage);
    };
  }, [dispatch]);

  return null;
}

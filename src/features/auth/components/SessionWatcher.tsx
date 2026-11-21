"use client";

import { useEffect } from "react";
import { API_TAGS } from "@/lib/api/apiTags";
import { UNAUTHORIZED_EVENT } from "@/lib/api/baseQuery";
import { useAppDispatch } from "@/lib/store";
import { authApi } from "../api/authApi";

// When a call comes back 401 even after a refresh (the session expired or was revoked elsewhere, e.g. "log out
// all devices"), re-check the session, so the whole app switches to signed out at once.
export default function SessionWatcher() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const recheck = () => dispatch(authApi.util.invalidateTags([API_TAGS.Auth]));
    window.addEventListener(UNAUTHORIZED_EVENT, recheck);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, recheck);
  }, [dispatch]);

  return null;
}

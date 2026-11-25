import { env } from "@/lib/env";

// Where requests to the GodsWheel API go.
// In the browser: this app's own /api/v1 (the same path the API uses), which next.config.ts forwards to the API.
// That keeps every call same-origin (no CORS); see the rewrite in next.config.ts.
// On the server: straight to the API.
const API_PATH = new URL(env.NEXT_PUBLIC_API_BASE_URL).pathname.replace(/\/+$/, "");

export const API_BASE_URL =
  typeof window === "undefined" ? env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "") : `${window.location.origin}${API_PATH}`;

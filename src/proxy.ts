import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";

// Runs on (almost) every request to do two unrelated jobs:
//  1. Redirect signed-out users away from protected routes to sign-in.
//  2. Set a Content-Security-Policy header with a fresh nonce on every response —
//     required so Next's own inline scripts are allowed to run, since we don't
//     allow 'unsafe-inline' in our script-src.

// Add a route prefix here as each signed-in area is built (e.g. "/dashboard").
const PROTECTED_PREFIXES: string[] = [];
const SIGN_IN_PATH = "/sign-in";

// Only set once the real backend is in use; until then the app talks to its in-browser mock only.
const API_ORIGIN = env.NEXT_PUBLIC_API_BASE_URL ? new URL(env.NEXT_PUBLIC_API_BASE_URL).origin : "";

function buildContentSecurityPolicy(nonce: string) {
  // The dev server's Fast Refresh relies on eval() for accurate stack traces —
  // only allow it outside production, where it stays disabled.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    process.env.NODE_ENV !== "production" && "'unsafe-eval'",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src 'self'${API_ORIGIN ? ` ${API_ORIGIN}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !request.cookies.has(env.NEXT_PUBLIC_SESSION_COOKIE_NAME)) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  // Matches every route except static assets, so the CSP nonce is set on every
  // page — not just the protected ones checked above.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};

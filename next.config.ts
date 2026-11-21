import type { NextConfig } from "next";

// CSP is set per-request in src/proxy.ts (needs a fresh nonce each time).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Allows the dev server to accept requests from a LAN origin (e.g. testing on a phone).
const devOrigins = process.env.NEXT_PUBLIC_APP_URL
  ? [new URL(process.env.NEXT_PUBLIC_APP_URL).hostname]
  : [];

// Same-origin API proxy. The browser calls this app's own /api/v1/* and Next forwards it to the GodsWheel API.
// Why: the API's refresh-token cookie (HttpOnly, path=/api/v1/auth/refresh) is set by whichever host the browser
// called. Called directly, that's another site's cookie, which Safari and Firefox block, so users would be signed
// out on every reload. Through this proxy it's this site's own cookie, and the path still matches.
// Keep the default in sync with NEXT_PUBLIC_API_BASE_URL's in src/lib/env.ts.
const apiBaseUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "https://godswheel.gigalixirapp.com/api/v1");
const apiPath = apiBaseUrl.pathname.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  ...(devOrigins.length > 0 && { allowedDevOrigins: devOrigins }),
  async rewrites() {
    return [{ source: `${apiPath}/:path*`, destination: `${apiBaseUrl.origin}${apiPath}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

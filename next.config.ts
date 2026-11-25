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

// Same-origin API proxy. The browser calls this app's own /api/v1/* and Next forwards it to the GodsWheel API,
// so calls are same-origin: no CORS setup or preflight requests. (It was first added for the API's old refresh
// cookie, which needed to be first-party; sessions are now a Bearer token saved on the device.)
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

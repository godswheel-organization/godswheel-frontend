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

// Same-origin API proxy: when set, the browser calls this app's own /v1 and /healthz and Next forwards them
// to the backend. Host-only cookies set by the backend only reach the app if the browser sees one host.
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  ...(devOrigins.length > 0 && { allowedDevOrigins: devOrigins }),
  async rewrites() {
    return apiProxyTarget
      ? [
          { source: "/v1/:path*", destination: `${apiProxyTarget}/v1/:path*` },
          { source: "/healthz", destination: `${apiProxyTarget}/healthz` },
        ]
      : [];
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

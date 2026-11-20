// The site's identity for search engines and link previews. Server-side only (Vercel's variables aren't public).

export const SITE_NAME = "GodsWheel";
export const SITE_TAGLINE = "Sermons by speaker, category or scripture";
export const SITE_DESCRIPTION =
  "Listen to sermons by speaker, category or scripture. Search for a message, press play, and save the ones that speak to you.";
export const SITE_KEYWORDS = [
  "sermons",
  "sermon audio",
  "Christian sermons",
  "listen to sermons online",
  "preaching",
  "Bible teaching",
  "sermons on faith",
  "sermons on prayer",
];
export const SITE_LOCALE = "en_GB";

// The public address every absolute URL is built from (canonical links, sitemap, Open Graph).
// NEXT_PUBLIC_APP_URL wins (set it to the real domain once there is one); then Vercel's production domain,
// or the deployment's own URL on previews; then localhost in development.
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  for (const candidate of candidates) {
    try {
      if (candidate?.trim()) return new URL(candidate.trim()).origin;
    } catch {
      // Not a URL: try the next one.
    }
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const SITE_URL = resolveSiteUrl();

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

// Only the production deployment should be indexed; previews and local servers ask crawlers to stay out.
export const IS_INDEXABLE_DEPLOYMENT = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

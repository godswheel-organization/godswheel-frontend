import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { headers } from "next/headers";
import { BASE_OPEN_GRAPH } from "@/lib/seo/metadata";
import {
  IS_INDEXABLE_DEPLOYMENT,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo/site";
import LaunchSplash from "@/shared/pwa/launch-splash/LaunchSplash";
import { SPLASH_SCRIPT } from "@/shared/pwa/launch-splash/splashConfig";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for headlines (`font-serif`).
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  // Italic for quoted scripture (the sidebar verse card).
  style: ["normal", "italic"],
});

// Site-wide defaults. Each page sets its own title, description and canonical URL via lib/seo/metadata.ts;
// the share image comes from ./opengraph-image.tsx (sermons draw their own).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: "religion",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Only the production deployment asks to be indexed (see lib/seo/site.ts). Pages can opt out further.
  robots: IS_INDEXABLE_DEPLOYMENT
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
    : { index: false, follow: false },
  openGraph: { ...BASE_OPEN_GRAPH, title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  // Stops iOS turning numbers (verse references, durations) into phone links.
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  // Lets iPhones open the installed app full-screen, like Android does from the manifest.
  appleWebApp: { capable: true, title: "GodsWheel", statusBarStyle: "black-translucent" },
};

// Matches --color-background, so the browser/OS chrome blends into the app.
export const viewport: Viewport = {
  themeColor: "#0f1220",
  colorScheme: "dark",
};

// Nonce-based CSP (src/proxy.ts) needs dynamic rendering, or scripts ship without a nonce and get blocked.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The CSP nonce (set by src/proxy.ts), so the launch splash's inline script is allowed to run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // Browser extensions (Grammarly, password managers, dark-mode tools) add attributes to <html>/<body>
  // before React loads; suppressHydrationWarning ignores those two elements' attributes only, not their children.
  // The brand is dark-only, so `dark` is always on and every `dark:` variant applies.
  return (
    // data-scroll-behavior: lets Next turn smooth scrolling off during route changes (it only smooths in-page anchors).
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before the first paint, so the splash covers the screen from the first frame (no flash). */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LaunchSplash />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

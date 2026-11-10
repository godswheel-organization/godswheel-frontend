import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
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
});

export const metadata: Metadata = {
  title: { default: "GodsWheel", template: "%s · GodsWheel" },
  description: "Find sermons by speaker, topic or scripture.",
  manifest: "/manifest.webmanifest",
};

// Matches --color-background, so the browser/OS chrome blends into the app.
export const viewport: Viewport = {
  themeColor: "#0f1220",
  colorScheme: "dark",
};

// Nonce-based CSP (src/proxy.ts) needs dynamic rendering, or scripts ship without a nonce and get blocked.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

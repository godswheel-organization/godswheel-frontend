import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Godswheel",
  description: "Godswheel web app.",
};

// Matches --color-background, so the browser/OS chrome blends into the app.
export const viewport: Viewport = {
  themeColor: "#161312",
  colorScheme: "dark",
};

// Nonce-based CSP (src/proxy.ts) needs dynamic rendering, or scripts ship without a nonce and get blocked.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Browser extensions (Grammarly, password managers, dark-mode tools) add attributes to <html>/<body>
  // before React loads; suppressHydrationWarning ignores those two elements' attributes only, not their children.
  // The brand is dark-only, so `dark` is always on and every `dark:` variant applies.
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

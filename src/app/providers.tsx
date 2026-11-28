"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import SessionWatcher from "@/features/auth/components/SessionWatcher";
import { store } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      {/* After children, not before: a sibling ahead of the page shifts the ids React's useId generates inside it,
          and the server and browser then disagree (a hydration error in the sidebar's Explore list). */}
      <SessionWatcher />
      <Toaster
        position="top-center"
        // Below the phone's top bar rather than over its buttons; near the top of the window from md up, where
        // the sidebar takes the bar's place.
        containerClassName="top-[calc(env(safe-area-inset-top)+4.75rem)]! md:top-5!"
        toastOptions={{
          duration: 3500,
          // Dressed like the app's own cards. Styles, not classes: the toast's built-in look is set inline.
          style: {
            background: "var(--color-surface-raised)",
            color: "var(--color-foreground)",
            border: "1px solid color-mix(in srgb, var(--color-border) 70%, transparent)",
            borderRadius: "1rem",
            padding: "0.625rem 0.875rem",
            maxWidth: "min(24rem, calc(100vw - 2rem))",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            boxShadow: "0 16px 32px -12px rgb(0 0 0 / 0.55)",
          },
          // The built-in tick and cross in the brand's colours (sunrise, coral) on the toast's own fill.
          success: { iconTheme: { primary: "#f28c4b", secondary: "#242a45" } },
          error: { iconTheme: { primary: "#ff797a", secondary: "#242a45" } },
        }}
      />
    </Provider>
  );
}

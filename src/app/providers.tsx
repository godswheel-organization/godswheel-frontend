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
      <Toaster position="top-center" />
    </Provider>
  );
}

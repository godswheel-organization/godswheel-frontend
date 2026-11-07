"use client";

import { useEffect } from "react";
import MinimalHeader from "@/shared/layouts/MinimalHeader";
import ErrorState from "@/shared/ui/error-state/ErrorState";
import Button from "@/shared/ui/button/Button";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <MinimalHeader />
        <ErrorState
          message="The application ran into an unexpected error. Please refresh the page."
          action={<Button onClick={reset}>Try again</Button>}
        />
      </body>
    </html>
  );
}

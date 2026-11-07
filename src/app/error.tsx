"use client";

import { useEffect } from "react";
import MinimalHeader from "@/shared/layouts/MinimalHeader";
import ErrorState from "@/shared/ui/error-state/ErrorState";
import Button from "@/shared/ui/button/Button";

export default function Error({
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
    <div className="flex min-h-screen flex-col">
      <MinimalHeader />
      <ErrorState
        message="An unexpected error occurred. You can try again, or come back later if the problem persists."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}

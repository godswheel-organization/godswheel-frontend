"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import Button from "@/shared/ui/button/Button";
import { Card } from "@/shared/ui/card";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-25 p-4 dark:bg-gray-950">
      <Card className="flex w-full max-w-md flex-col items-center px-6 py-14 text-center sm:px-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <WifiOff className="size-9 text-gray-500 dark:text-gray-400" />
        </div>

        <h1 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white/90">
          You&rsquo;re offline
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          This page isn&rsquo;t available without an internet connection. Any
          progress you&rsquo;ve already entered is saved on this
          device and will sync once you&rsquo;re back online.
        </p>

        <Button
          type="button"
          onClick={() => window.location.reload()}
          startIcon={<RefreshCw className="size-4" />}
          className="mt-8 px-5 py-2.5 text-sm font-medium"
        >
          Try again
        </Button>
      </Card>
    </div>
  );
}

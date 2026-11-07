import type { ReactNode } from "react";
import Image from "next/image";

interface ErrorStateProps {
  title?: string;
  illustration?: { src: string; width: number; height: number };
  message: string;
  action?: ReactNode;
}

export default function ErrorState({ title = "ERROR", illustration, message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white/90">{title}</p>

      {illustration && (
        <Image
          src={illustration.src}
          alt=""
          width={illustration.width}
          height={illustration.height}
          className="h-auto w-full max-w-md"
          priority
        />
      )}

      <p className="max-w-md text-lg text-gray-600 dark:text-gray-400">{message}</p>

      {action}
    </div>
  );
}

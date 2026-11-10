"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

interface BackButtonProps {
  icon: "back" | "close";
  label: string;
  // Used when there is no history to return to (e.g. the page was opened from a link).
  fallbackHref: string;
}

export default function BackButton({ icon, label, fallbackHref }: BackButtonProps) {
  const router = useRouter();
  const Icon = icon === "close" ? X : ArrowLeft;

  const handleClick = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
    >
      <Icon className="size-6" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

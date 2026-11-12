"use client";

import { Share2 } from "lucide-react";
import { useShareSermon } from "../../hooks/useShareSermon";
import type { Sermon } from "../../types";

interface ShareSermonButtonProps {
  sermon: Pick<Sermon, "id" | "title" | "preacher">;
}

export default function ShareSermonButton({ sermon }: ShareSermonButtonProps) {
  const share = useShareSermon(sermon);

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${sermon.title}`}
      className="-mr-2.5 flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
    >
      <Share2 className="size-6" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

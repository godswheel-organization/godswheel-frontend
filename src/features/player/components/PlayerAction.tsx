import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PlayerActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  // Orange: the reading tools (Bible, Note), or a toggle that's on (Saved).
  highlighted?: boolean;
  pressed?: boolean;
  ariaLabel?: string;
}

// One of the icon-over-label buttons along the bottom of the full player.
export default function PlayerAction({ icon: Icon, label, onClick, highlighted, pressed, ariaLabel }: PlayerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-14 flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition hover:bg-surface",
        highlighted ? "text-brand-500" : "text-foreground"
      )}
    >
      <Icon className={cn("size-6", pressed && "fill-brand-500/20")} strokeWidth={1.75} aria-hidden />
      {label}
    </button>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ChipButtonProps {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}

// A chip that picks something on the current screen (vs. Chip, which links somewhere). Same look as Chip.
export default function ChipButton({ pressed, onClick, children }: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm transition",
        pressed
          ? "border-brand-500 bg-brand-500 font-medium text-on-brand"
          : "border-border text-foreground hover:border-brand-500/50 hover:bg-surface-raised"
      )}
    >
      {children}
    </button>
  );
}

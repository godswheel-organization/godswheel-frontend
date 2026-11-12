import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ChipRowProps {
  label: string;
  children: ReactNode;
  className?: string;
}

// One scrollable line of chips on phones (fading out at the right edge), wrapping onto more lines from md up.
export default function ChipRow({ label, children, className }: ChipRowProps) {
  return (
    <div className={cn("relative", className)}>
      <ul
        aria-label={label}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        {children}
      </ul>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-4 w-12 bg-linear-to-l from-background sm:-right-6 md:hidden"
      />
    </div>
  );
}

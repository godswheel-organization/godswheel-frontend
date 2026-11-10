import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  // 0–1.
  value: number;
  label: string;
  className?: string;
}

export default function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-1 overflow-hidden rounded-full bg-surface-raised", className)}
    >
      <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
    </div>
  );
}

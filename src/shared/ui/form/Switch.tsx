import { cn } from "@/lib/utils/cn";

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// An on/off toggle. Label it with <label htmlFor={id}> next to it.
export default function Switch({ id, checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition disabled:opacity-60",
        checked ? "border-brand-500 bg-brand-500" : "border-border bg-surface"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full transition-transform",
          checked ? "translate-x-6 bg-on-brand" : "translate-x-1 border-2 border-foreground/80"
        )}
      />
    </button>
  );
}

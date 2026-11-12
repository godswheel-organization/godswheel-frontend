import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<ComponentProps<"select">, "id" | "children"> {
  id: string;
  label: string;
  options: SelectOption[];
}

// A native <select> (best on phones) with its label sitting inside the box, as in the filter sheet design.
export default function SelectField({ id, label, options, className, ...selectProps }: SelectFieldProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-surface transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30",
        className
      )}
    >
      <label htmlFor={id} className="pointer-events-none absolute left-4 top-2 text-xs text-muted">
        {label}
      </label>
      <select
        id={id}
        className="block w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent bg-none pb-2.5 pl-4 pr-11 pt-7 text-base text-foreground focus:outline-none focus:ring-0 [&>option]:bg-surface"
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-foreground" aria-hidden />
    </div>
  );
}

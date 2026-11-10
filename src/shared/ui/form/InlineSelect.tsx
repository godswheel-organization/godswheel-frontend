import { ChevronDown } from "lucide-react";
import type { SelectOption } from "./SelectField";

interface InlineSelectProps<T extends string> {
  id: string;
  // Shown before the value, e.g. "Sort:". Visually hidden when `hideLabel` (the options say it all).
  label: string;
  hideLabel?: boolean;
  value: T;
  options: (SelectOption & { value: T })[];
  onChange: (value: T) => void;
}

// A select that reads as plain text ("Sort: Relevance ⌄", "Newest first ⌄"), for list toolbars.
export default function InlineSelect<T extends string>({ id, label, hideLabel, value, options, onChange }: InlineSelectProps<T>) {
  return (
    <div className="relative flex items-center gap-1 text-base text-foreground">
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="cursor-pointer appearance-none border-0 bg-transparent bg-none py-1 pl-0 pr-7 text-base font-medium text-foreground focus:outline-none focus:ring-0 focus-visible:underline [&>option]:bg-surface"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 size-4 text-muted" aria-hidden />
    </div>
  );
}

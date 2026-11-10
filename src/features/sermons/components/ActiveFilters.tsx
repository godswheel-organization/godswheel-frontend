import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SermonFilters } from "../types";

type RemovableFilter = "speaker" | "book";

interface ActiveFiltersProps {
  filters: SermonFilters;
  onRemove: (filter: RemovableFilter) => void;
  onClearAll: () => void;
  className?: string;
}

// The speaker/book picked in the filter sheet, each removable, plus "Clear all".
// (The topic shows as the lit chip in the row above, so it isn't repeated here.)
export default function ActiveFilters({ filters, onRemove, onClearAll, className }: ActiveFiltersProps) {
  const chips = [
    filters.speaker && { filter: "speaker" as const, label: filters.speaker },
    filters.book && { filter: "book" as const, label: filters.book },
  ].filter(Boolean) as { filter: RemovableFilter; label: string }[];

  return (
    <div className={cn("flex flex-col items-start gap-4", className)}>
      {chips.length > 0 && (
        <ul aria-label="Active filters" className="flex flex-wrap gap-3">
          {chips.map(({ filter, label }) => (
            <li key={filter}>
              <button
                type="button"
                onClick={() => onRemove(filter)}
                aria-label={`Remove filter: ${label}`}
                className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-base text-brand-500 transition hover:bg-surface-raised"
              >
                {label}
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onClearAll} className="text-base font-medium text-brand-500 transition hover:text-brand-300">
        Clear all
      </button>
    </div>
  );
}

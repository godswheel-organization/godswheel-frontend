import InlineSelect from "@/shared/ui/form/InlineSelect";
import { SORT_OPTIONS } from "../lib/sermonFilters";
import type { SermonSort } from "../types";

interface ResultsBarProps {
  total: number | undefined;
  sort: SermonSort;
  onSortChange: (sort: SermonSort) => void;
}

export default function ResultsBar({ total, sort, onSortChange }: ResultsBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Announced on change, so screen-reader users hear the effect of each filter. */}
      <p aria-live="polite" className="text-base text-foreground">
        {total === undefined ? " " : `${total} ${total === 1 ? "sermon" : "sermons"}`}
      </p>
      <InlineSelect id="sermon-sort" label="Sort:" value={sort} options={SORT_OPTIONS} onChange={onSortChange} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Button from "@/shared/ui/button/Button";
import SelectField from "@/shared/ui/form/SelectField";
import Sheet from "@/shared/ui/modal/Sheet";
import { useGetSermonFilterOptionsQuery } from "../api/sermonsApi";
import { TOPIC_ORDER, TOPICS } from "../lib/topics";
import type { SermonFilters, SermonTopic } from "../types";

export type SheetFilters = Pick<SermonFilters, "topic" | "speaker" | "book">;

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SheetFilters;
  onApply: (filters: SheetFilters) => void;
}

export default function FilterSheet({ open, onOpenChange, filters, onApply }: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Filter by">
      <FilterForm
        initial={filters}
        onApply={(next) => {
          onApply(next);
          onOpenChange(false);
        }}
      />
    </Sheet>
  );
}

// Lives inside the sheet, so it mounts on open: the draft always starts from the filters in force,
// and nothing changes until Apply.
function FilterForm({ initial, onApply }: { initial: SheetFilters; onApply: (filters: SheetFilters) => void }) {
  const { data: options } = useGetSermonFilterOptionsQuery();
  const [draft, setDraft] = useState<SheetFilters>(initial);

  const toOptions = (values: string[] = []) => values.map((value) => ({ value, label: value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
      className="flex flex-col gap-3"
    >
      <SelectField
        id="filter-topic"
        label="Topic"
        value={draft.topic ?? ""}
        onChange={(event) => setDraft({ ...draft, topic: (event.target.value || undefined) as SermonTopic | undefined })}
        options={[{ value: "", label: "All topics" }, ...TOPIC_ORDER.map((topic) => ({ value: topic, label: TOPICS[topic].label }))]}
      />
      <SelectField
        id="filter-speaker"
        label="Speaker"
        value={draft.speaker ?? ""}
        onChange={(event) => setDraft({ ...draft, speaker: event.target.value || undefined })}
        options={[{ value: "", label: "All speakers" }, ...toOptions(options?.speakers)]}
      />
      <SelectField
        id="filter-book"
        label="Scripture"
        value={draft.book ?? ""}
        onChange={(event) => setDraft({ ...draft, book: event.target.value || undefined })}
        options={[{ value: "", label: "All books" }, ...toOptions(options?.books)]}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => setDraft({})}>
          Reset
        </Button>
        <Button type="submit" size="lg">
          Apply
        </Button>
      </div>
    </form>
  );
}

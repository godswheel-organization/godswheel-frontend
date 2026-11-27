"use client";

import { useState } from "react";
import Button from "@/shared/ui/button/Button";
import SelectField from "@/shared/ui/form/SelectField";
import Sheet from "@/shared/ui/modal/Sheet";
import { useGetCategoriesQuery, useGetSpeakersQuery } from "../api/sermonsApi";
import { BIBLE_BOOKS } from "../lib/bibleBooks";
import type { SermonFilters } from "../types";

export type SheetFilters = Pick<SermonFilters, "category" | "speaker" | "book">;

// Every key spelled out, even when empty: the page merges what the sheet sends onto the current URL, so a key
// that's missing (rather than undefined) would leave that filter as it was.
const sheetFilters = ({ category, speaker, book }: SheetFilters): SheetFilters => ({ category, speaker, book });
const NO_SHEET_FILTERS = sheetFilters({});

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

// Lives inside the sheet, so it mounts on open: the draft always starts from the filters in force.
// Apply sends the draft; Reset clears all three filters straight away and closes the sheet.
function FilterForm({ initial, onApply }: { initial: SheetFilters; onApply: (filters: SheetFilters) => void }) {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: speakers = [] } = useGetSpeakersQuery();
  const [draft, setDraft] = useState<SheetFilters>(initial);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply(sheetFilters(draft));
      }}
      className="flex flex-col gap-3"
    >
      <SelectField
        id="filter-category"
        label="Category"
        value={draft.category ?? ""}
        onChange={(event) => setDraft({ ...draft, category: event.target.value || undefined })}
        options={[{ value: "", label: "All categories" }, ...categories.map((category) => ({ value: category.slug, label: category.name }))]}
      />
      <SelectField
        id="filter-speaker"
        label="Speaker"
        value={draft.speaker ?? ""}
        onChange={(event) => setDraft({ ...draft, speaker: event.target.value || undefined })}
        options={[
          { value: "", label: "All speakers" },
          ...[...speakers].sort((a, b) => a.name.localeCompare(b.name)).map((speaker) => ({ value: speaker.id, label: speaker.name })),
        ]}
      />
      <SelectField
        id="filter-book"
        label="Scripture"
        value={draft.book ?? ""}
        onChange={(event) => setDraft({ ...draft, book: event.target.value || undefined })}
        options={[{ value: "", label: "All books" }, ...BIBLE_BOOKS.map((book) => ({ value: book, label: book }))]}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => onApply(NO_SHEET_FILTERS)}>
          Reset
        </Button>
        <Button type="submit" size="lg">
          Apply
        </Button>
      </div>
    </form>
  );
}

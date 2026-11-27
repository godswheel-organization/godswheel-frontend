import Chip from "@/shared/ui/chip/Chip";
import ChipRow from "@/shared/ui/chip/ChipRow";
import { Skeleton } from "@/shared/ui/skeleton/Skeleton";
import type { CategoryRef } from "../types";

// Written out in full so Tailwind finds them.
const PLACEHOLDER_WIDTHS = ["w-36", "w-28", "w-32", "w-24", "w-40"];

interface CategoryChipsProps {
  // The API's categories; undefined while they load (placeholder chips hold the row's place).
  categories: CategoryRef[] | undefined;
  // No category = "All" is lit.
  activeCategory?: string;
  // Where each chip leads, by category slug; undefined is the "All" chip.
  hrefFor: (slug: string | undefined) => string;
  // false when the chips filter the page they're on, so tapping one doesn't jump to the top.
  scroll?: boolean;
  className?: string;
}

export default function CategoryChips({ categories, activeCategory, hrefFor, scroll, className }: CategoryChipsProps) {
  return (
    <ChipRow label="Categories" className={className}>
      <li>
        <Chip href={hrefFor(undefined)} active={!activeCategory} scroll={scroll}>
          All
        </Chip>
      </li>
      {categories
        ? categories.map((category) => (
            <li key={category.slug}>
              <Chip href={hrefFor(category.slug)} active={activeCategory === category.slug} scroll={scroll}>
                {category.name}
              </Chip>
            </li>
          ))
        : PLACEHOLDER_WIDTHS.map((width, index) => (
            <li key={index} aria-hidden>
              <Skeleton className={`h-11.5 shrink-0 rounded-full ${width}`} />
            </li>
          ))}
    </ChipRow>
  );
}

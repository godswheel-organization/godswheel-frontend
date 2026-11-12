import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SegmentedLinksProps {
  label: string;
  items: { label: string; href: string }[];
  activeHref: string;
  className?: string;
}

// A segmented control whose segments are pages (e.g. Privacy notice | Terms): each is a real link, so each
// view has its own URL and Back works. The current one is marked aria-current="page".
export default function SegmentedLinks({ label, items, activeHref, className }: SegmentedLinksProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="grid rounded-2xl border border-border bg-surface p-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl text-sm transition",
                  active ? "border border-border bg-background font-semibold text-foreground shadow-theme-xs" : "text-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

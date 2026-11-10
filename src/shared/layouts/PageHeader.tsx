import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import BackButton from "@/shared/ui/button/BackButton";

interface PageHeaderProps {
  title: string;
  // Where Back goes when there's no history (e.g. the page was opened from a link).
  backHref: string;
  action?: ReactNode;
  // "page": the big serif title (Saved sermons). "compact": a small bold label (Sermon detail, Report an issue).
  variant?: "page" | "compact";
  // "p" when the page's own main heading is further down (e.g. the sermon title on Sermon detail).
  titleAs?: "h1" | "p";
}

// A sub-page's header: Back on the left, the title centred, an optional action on the right.
export default function PageHeader({ title, backHref, action, variant = "page", titleAs: Title = "h1" }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center">
      <BackButton icon="back" label="Back" fallbackHref={backHref} />
      <Title
        className={cn(
          "truncate text-center text-foreground",
          variant === "page" ? "font-serif text-3xl" : "text-base font-semibold"
        )}
      >
        {title}
      </Title>
      <div className="justify-self-end">{action}</div>
    </header>
  );
}

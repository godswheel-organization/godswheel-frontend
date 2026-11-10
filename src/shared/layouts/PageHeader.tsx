import type { ReactNode } from "react";
import BackButton from "@/shared/ui/button/BackButton";

interface PageHeaderProps {
  title: string;
  // Where Back goes when there's no history (e.g. the page was opened from a link).
  backHref: string;
  action?: ReactNode;
}

// A sub-page's header: Back on the left, the title centred in the serif face (e.g. "Saved sermons").
export default function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center">
      <BackButton icon="back" label="Back" fallbackHref={backHref} />
      <h1 className="truncate text-center font-serif text-3xl text-foreground">{title}</h1>
      <div className="justify-self-end">{action}</div>
    </header>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const rowClasses =
  "flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left text-foreground transition hover:text-brand-300 disabled:opacity-60";

type ListRowProps = { label: string; trailing?: ReactNode } & (
  | { href: string; onClick?: never; disabled?: never }
  | { onClick: () => void; href?: never; disabled?: boolean }
);

// One line in a list of options (Settings, About): a link to another page, or a button that does something here.
export default function ListRow({ label, trailing, href, onClick, disabled }: ListRowProps) {
  const content = (
    <>
      <span>{label}</span>
      {trailing ?? <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />}
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className={rowClasses}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} disabled={disabled} className={rowClasses}>
          {content}
        </button>
      )}
    </li>
  );
}

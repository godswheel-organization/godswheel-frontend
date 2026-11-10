import Link from "next/link";
import { Cross } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  // Where the logo leads: the landing page by default; the app shell passes its own home.
  href?: string;
  className?: string;
}

// TODO(design): swap the lucide cross for the real GodsWheel mark once the brand assets are available.
export default function Logo({ href = ROUTES.landing, className }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface">
        <Cross className="size-5 text-foreground" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-xl font-semibold tracking-tight text-foreground">GodsWheel</span>
    </Link>
  );
}

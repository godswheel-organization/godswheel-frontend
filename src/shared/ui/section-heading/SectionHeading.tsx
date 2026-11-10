import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  // Sits opposite the title on wide screens (e.g. a "See all" link).
  action?: ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">{eyebrow}</p>
        )}
        <h2 id={id} className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-base text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

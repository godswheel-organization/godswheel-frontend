import { cn } from "@/lib/utils/cn";
import { categoryStyle } from "../lib/categories";

interface SermonArtworkProps {
  // The sermon's main category slug; unknown or missing gets the neutral fallback.
  category?: string;
  className?: string;
  iconClassName?: string;
}

// Stand-in cover art: a category-tinted gradient with the category's icon, used until sermons have real images.
export default function SermonArtwork({ category, className, iconClassName }: SermonArtworkProps) {
  const { icon: Icon, tint } = categoryStyle(category);

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-linear-to-br via-surface to-surface-raised",
        tint,
        className
      )}
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/5 blur-xl" />
      <Icon className={cn("relative size-7 text-foreground/80", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}

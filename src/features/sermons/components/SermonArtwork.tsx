import { cn } from "@/lib/utils/cn";
import { TOPICS } from "../lib/topics";
import type { SermonTopic } from "../types";

interface SermonArtworkProps {
  topic: SermonTopic;
  className?: string;
  iconClassName?: string;
}

// Stand-in cover art: a topic-tinted gradient with the topic's icon, used until sermons have real images.
export default function SermonArtwork({ topic, className, iconClassName }: SermonArtworkProps) {
  const { icon: Icon, tint } = TOPICS[topic];

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

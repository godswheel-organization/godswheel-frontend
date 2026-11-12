import { BookOpen, Flame, HandHeart, Megaphone, Music, Users, type LucideIcon } from "lucide-react";
import type { SermonTopic } from "../types";

interface TopicMeta {
  label: string;
  icon: LucideIcon;
  // Tailwind gradient start for the topic's artwork tile.
  tint: string;
}

// Display order of topics across the app (topic grid, filters).
export const TOPIC_ORDER: SermonTopic[] = ["purpose", "calling", "faith", "prayer", "family", "worship"];

export const TOPICS: Record<SermonTopic, TopicMeta> = {
  purpose: { label: "Purpose", icon: Flame, tint: "from-brand-500/45" },
  calling: { label: "Calling", icon: Megaphone, tint: "from-blue-light-500/35" },
  faith: { label: "Faith", icon: BookOpen, tint: "from-success-500/30" },
  prayer: { label: "Prayer", icon: HandHeart, tint: "from-warning-400/35" },
  family: { label: "Family", icon: Users, tint: "from-brand-300/35" },
  worship: { label: "Worship", icon: Music, tint: "from-error-400/30" },
};

import {
  Anchor,
  BookOpen,
  Compass,
  Cross,
  Flame,
  Footprints,
  Gift,
  HandHeart,
  Heart,
  Hourglass,
  Landmark,
  Megaphone,
  Mountain,
  Sprout,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { CategoryRef, Sermon } from "../types";

interface CategoryStyle {
  icon: LucideIcon;
  // Tailwind gradient start for the category's artwork tile (written out in full so Tailwind finds it).
  tint: string;
}

// Icons and colours for the categories the API has today. The list itself comes from the API, so a category added
// later still works: it gets the fallback until it's given its own entry here.
const STYLES: Record<string, CategoryStyle> = {
  "biblical-doctrine": { icon: Landmark, tint: "from-blue-light-500/35" },
  "biblical-history": { icon: Hourglass, tint: "from-warning-400/35" },
  "christian-living": { icon: Footprints, tint: "from-success-500/30" },
  "evangelism-discipleship": { icon: Megaphone, tint: "from-brand-500/45" },
  "faith-trust": { icon: Mountain, tint: "from-success-500/30" },
  "holy-spirit": { icon: Flame, tint: "from-brand-500/45" },
  "hope-encouragement": { icon: Sunrise, tint: "from-warning-400/35" },
  "jesus-christ": { icon: Cross, tint: "from-brand-300/35" },
  leadership: { icon: Compass, tint: "from-blue-light-500/35" },
  "love-relationships": { icon: Heart, tint: "from-error-400/30" },
  "prayer-worship": { icon: HandHeart, tint: "from-warning-400/35" },
  salvation: { icon: Gift, tint: "from-brand-300/35" },
  "salvation-redemption": { icon: Anchor, tint: "from-blue-light-500/35" },
  "spiritual-growth": { icon: Sprout, tint: "from-success-500/30" },
};

const FALLBACK: CategoryStyle = { icon: BookOpen, tint: "from-brand-500/30" };

export const categoryStyle = (slug: string | undefined): CategoryStyle => (slug && STYLES[slug]) || FALLBACK;

// A sermon's categories, defensively: sermons saved on the device before categories existed have none.
export const sermonCategories = (sermon: Pick<Sermon, "categories">): CategoryRef[] =>
  Array.isArray(sermon.categories) ? sermon.categories : [];

// The main category: the one the cover art and the card's label use.
export const primaryCategory = (sermon: Pick<Sermon, "categories">): CategoryRef | undefined => sermonCategories(sermon)[0];

// Slugs are lowercase words joined by hyphens ("faith-trust"); anything else in the URL is ignored.
export const isCategorySlug = (value: string | null | undefined): value is string =>
  typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

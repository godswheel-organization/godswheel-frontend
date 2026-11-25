import { BookOpen, Bookmark, Flame, Headphones, NotebookPen, Search, Share2, Sprout, type LucideIcon } from "lucide-react";
import type { NavItem } from "@/shared/layouts/SiteHeader";

// All landing-page copy lives here — keep it short; components only lay it out.

export const SECTION_IDS = {
  topics: "categories",
  featured: "featured",
  howItWorks: "how-it-works",
  mission: "mission",
} as const;

export const LANDING_NAV: NavItem[] = [
  { label: "Categories", href: `#${SECTION_IDS.topics}` },
  { label: "Featured", href: `#${SECTION_IDS.featured}` },
  { label: "How it works", href: `#${SECTION_IDS.howItWorks}` },
  { label: "Mission", href: `#${SECTION_IDS.mission}` },
];

export const HERO_COPY = {
  eyebrow: "Welcome to GodsWheel",
  title: "Make room for the Word.",
  description: "Sermons by speaker, topic or scripture — ready whenever you need them.",
  primaryCta: "Browse sermons",
  secondaryCta: "Create account",
  note: "No account needed to start listening.",
};

export const TOPICS_COPY = {
  eyebrow: "Categories",
  title: "Start where you are",
};

export const FEATURED_COPY = {
  eyebrow: "Featured",
  title: "Messages worth hearing",
  seeAll: "See all sermons",
};

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const HOW_IT_WORKS_COPY = {
  eyebrow: "How it works",
  title: "Listening made simple",
  steps: [
    { icon: Search, title: "Search", description: "Find a message by speaker, topic or verse." },
    { icon: Headphones, title: "Listen", description: "Press play. No sign-up needed." },
    { icon: Bookmark, title: "Save", description: "Keep favourites in your library with a free account." },
    { icon: NotebookPen, title: "Note", description: "Write a note at the moment a message speaks to you." },
    { icon: Share2, title: "Share", description: "Send a sermon to someone who needs to hear it." },
  ] satisfies Step[],
};

// The mission statement, word for word. `highlight` parts are picked out in the brand colour.
export const MISSION_COPY = {
  eyebrow: "Our mission",
  title: "Why GodsWheel exists",
  statement: [
    { text: "Our Mission is to help humanity access " },
    { text: "structured knowledge of the word of God", highlight: true },
    { text: " whereby they grow spiritually in a structured methodical way " },
    { text: "through the help of the Holy Spirit", highlight: true },
    { text: " and are able to be " },
    { text: "a vessel of His Glory", highlight: true },
    { text: ", worthy witnesses of our Lord Jesus Christ to a desperate world and into the experiential life (" },
    { text: "ZOE", highlight: true },
    { text: ") we have been called to live in." },
  ],
  scripture: {
    // King James Version, like the rest of the app's scripture.
    text: "I am come that they might have life, and that they might have it more abundantly.",
    reference: "John 10:10b",
  },
  pillars: [
    { icon: BookOpen, title: "Know the Word", description: "Structured knowledge of the word of God, open to everyone." },
    { icon: Sprout, title: "Grow by the Spirit", description: "Steady, methodical growth, through the help of the Holy Spirit." },
    { icon: Flame, title: "Live the ZOE life", description: "Vessels of His Glory and worthy witnesses of Jesus Christ." },
  ] satisfies Step[],
};

export const CLOSING_COPY = {
  title: "Keep the Word close.",
  description: "Create a free account to save sermons and come back to them anytime.",
  primaryCta: "Create free account",
  secondaryCta: "Sign in",
};

import { Bookmark, Library, NotebookPen, Share2, UserRound, type LucideIcon } from "lucide-react";
import type { AccountPromptReason } from "../../store/accountPromptSlice";

export type PromptKind = AccountPromptReason | "library" | "account";

// One message per feature a guest tried to use. Always reassures them they can keep listening.
export const PROMPT_COPY: Record<PromptKind, { icon: LucideIcon; title: string; body: string }> = {
  save: {
    icon: Bookmark,
    title: "Create an account to save sermons",
    body: "Saved sermons stay in your library on every device. You can keep listening without an account.",
  },
  share: {
    icon: Share2,
    title: "Create an account to share sermons",
    body: "Share sermons with others when you sign in. You can keep listening without an account.",
  },
  note: {
    icon: NotebookPen,
    title: "Create an account to take notes",
    body: "Notes are saved at the moment you write them, on every device. You can keep listening without an account.",
  },
  library: {
    icon: Library,
    title: "Your library lives in your account",
    body: "Sign in to see sermons you've saved and pick up where you stopped. You can keep listening without an account.",
  },
  account: {
    icon: UserRound,
    title: "Sign in to manage your account",
    body: "Your saved sermons, listening history and privacy choices live in your account. You can keep listening without one.",
  },
};

import toast from "react-hot-toast";
import { useSession } from "@/features/auth/hooks/useSession";
import { openAccountPrompt } from "@/features/auth/store/accountPromptSlice";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch } from "@/lib/store";
import type { Sermon } from "../types";

// Sharing needs an account (guests get the "Create an account to share sermons" prompt). Uses the
// phone's own share sheet where there is one, otherwise copies the link. Always shares the sermon's
// own page, wherever the button is (the full player sits over other pages).
export function useShareSermon(sermon: Pick<Sermon, "id" | "title" | "preacher">) {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useSession();

  return async () => {
    if (!isSignedIn) {
      dispatch(openAccountPrompt("share"));
      return;
    }

    const url = `${window.location.origin}${ROUTES.sermon(sermon.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: sermon.title, text: `${sermon.title} — ${sermon.preacher}`, url });
      } catch (error) {
        // AbortError just means the user closed the share sheet.
        if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Couldn't open sharing. Try again.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };
}

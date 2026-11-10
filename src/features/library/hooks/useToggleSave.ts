import toast from "react-hot-toast";
import { useSession } from "@/features/auth/hooks/useSession";
import { openAccountPrompt } from "@/features/auth/store/accountPromptSlice";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch } from "@/lib/store";
import { useGetSavedSermonsQuery, useSaveSermonMutation, useUnsaveSermonMutation } from "../api/libraryApi";

// The bookmark behaviour, shared by every save button (list rows, detail page, full player).
// Guests get the "Create an account to save sermons" prompt instead.
export function useToggleSave(sermon: Sermon) {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useSession();
  const { saved } = useGetSavedSermonsQuery(undefined, {
    skip: !isSignedIn,
    selectFromResult: ({ data }) => ({ saved: data?.some((item) => item.sermon.id === sermon.id) ?? false }),
  });
  const [saveSermon, { isLoading: isSaving }] = useSaveSermonMutation();
  const [unsaveSermon, { isLoading: isUnsaving }] = useUnsaveSermonMutation();

  const toggle = async () => {
    if (!isSignedIn) {
      dispatch(openAccountPrompt("save"));
      return;
    }
    try {
      await (saved ? unsaveSermon(sermon.id) : saveSermon(sermon)).unwrap();
    } catch {
      toast.error("Couldn't update your library. Try again.");
    }
  };

  return { saved, toggle, busy: isSaving || isUnsaving };
}

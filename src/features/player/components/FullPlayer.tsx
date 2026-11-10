"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bookmark,
  BookmarkCheck,
  BookOpenText,
  ChevronDown,
  Ellipsis,
  Info,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { openAccountPrompt } from "@/features/auth/store/accountPromptSlice";
import BibleSheet from "@/features/bible/components/BibleSheet";
import { useToggleSave } from "@/features/library/hooks/useToggleSave";
import NoteSheet from "@/features/notes/components/NoteSheet";
import SermonArtwork from "@/features/sermons/components/SermonArtwork";
import { useShareSermon } from "@/features/sermons/hooks/useShareSermon";
import type { Sermon } from "@/features/sermons/types";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import Sheet from "@/shared/ui/modal/Sheet";
import { closePlayer, durationOf, setExpanded, skipBy, togglePlayback } from "../store/playerSlice";
import PlayerAction from "./PlayerAction";
import SeekBar from "./SeekBar";

const SKIP_SECONDS = 15;

// The full-screen "Now playing" view, over whatever page is underneath. Opened from the mini player.
export default function FullPlayer() {
  const dispatch = useAppDispatch();
  const { current, expanded } = useAppSelector((state) => state.player);

  return (
    <Dialog.Root open={expanded && current !== null} onOpenChange={(open) => dispatch(setExpanded(open))}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-40 overflow-y-auto bg-background focus:outline-none motion-safe:data-[state=open]:animate-sheet-up"
        >
          {current && <NowPlaying sermon={current} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NowPlaying({ sermon }: { sermon: Sermon }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isPlaying, positionSeconds } = useAppSelector((state) => state.player);
  const { isSignedIn } = useSession();
  const { saved, toggle: toggleSave } = useToggleSave(sermon);
  const share = useShareSermon(sermon);
  const [openSheet, setOpenSheet] = useState<"bible" | "note" | "more" | null>(null);
  // Fixed when the note sheet opens, so "at 12:48" doesn't keep moving while you type.
  const [noteAt, setNoteAt] = useState(0);
  const duration = durationOf(sermon);
  const PlayIcon = isPlaying ? Pause : Play;

  const goToDetails = () => {
    dispatch(setExpanded(false));
    router.push(ROUTES.sermon(sermon.id));
  };

  const openNote = () => {
    if (!isSignedIn) {
      dispatch(openAccountPrompt("note"));
      return;
    }
    setNoteAt(positionSeconds);
    setOpenSheet("note");
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
      <header className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center">
        <Dialog.Close
          aria-label="Minimise player"
          className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          <ChevronDown className="size-6" strokeWidth={1.75} aria-hidden />
        </Dialog.Close>
        <Dialog.Title className="text-center text-base font-semibold text-foreground">Now playing</Dialog.Title>
        <button
          type="button"
          onClick={() => setOpenSheet("more")}
          aria-label="More options"
          className="-mr-2.5 flex size-11 items-center justify-center justify-self-end rounded-full text-foreground transition hover:bg-surface"
        >
          <Ellipsis className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      <SermonArtwork topic={sermon.topic} className="mx-auto mt-6 aspect-square w-full max-w-80 rounded-2xl" iconClassName="size-14" />

      <div className="mt-8 text-center">
        <p className="text-2xl font-semibold text-foreground">{sermon.title}</p>
        <p className="mt-2 text-muted">{sermon.preacher}</p>
      </div>

      <div className="mt-8">
        <SeekBar positionSeconds={positionSeconds} durationSeconds={duration} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-10">
        <button
          type="button"
          onClick={() => dispatch(skipBy(-SKIP_SECONDS))}
          aria-label={`Back ${SKIP_SECONDS} seconds`}
          className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs text-foreground transition hover:bg-surface"
        >
          <RotateCcw className="size-6" strokeWidth={1.75} aria-hidden />
          {SKIP_SECONDS} sec
        </button>
        <button
          type="button"
          onClick={() => dispatch(togglePlayback())}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex size-20 items-center justify-center rounded-full bg-brand-500 text-on-brand shadow-theme-lg transition hover:bg-brand-400"
        >
          <PlayIcon className="size-8 fill-current" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => dispatch(skipBy(SKIP_SECONDS))}
          aria-label={`Forward ${SKIP_SECONDS} seconds`}
          className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs text-foreground transition hover:bg-surface"
        >
          <RotateCw className="size-6" strokeWidth={1.75} aria-hidden />
          {SKIP_SECONDS} sec
        </button>
      </div>

      <div className="mt-auto flex justify-between pt-10">
        <PlayerAction
          icon={saved ? BookmarkCheck : Bookmark}
          label={saved ? "Saved" : "Save"}
          ariaLabel={saved ? `Remove ${sermon.title} from your library` : `Save ${sermon.title} to your library`}
          pressed={saved}
          highlighted={saved}
          onClick={toggleSave}
        />
        <PlayerAction icon={Share2} label="Share" onClick={share} />
        <PlayerAction icon={BookOpenText} label="Bible" highlighted onClick={() => setOpenSheet("bible")} />
        <PlayerAction icon={NotebookPen} label="Note" highlighted onClick={openNote} />
        <PlayerAction icon={Info} label="Details" onClick={goToDetails} />
      </div>

      <BibleSheet open={openSheet === "bible"} onOpenChange={(open) => setOpenSheet(open ? "bible" : null)} sermon={sermon} />
      <NoteSheet
        open={openSheet === "note"}
        onOpenChange={(open) => setOpenSheet(open ? "note" : null)}
        sermon={sermon}
        atSeconds={noteAt}
      />
      <Sheet open={openSheet === "more"} onOpenChange={(open) => setOpenSheet(open ? "more" : null)} title="More">
        <ul className="flex flex-col gap-2">
          <li>
            <button type="button" onClick={goToDetails} className="w-full rounded-xl px-4 py-3.5 text-left text-foreground transition hover:bg-surface-raised">
              Go to sermon details
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => dispatch(closePlayer())}
              className="w-full rounded-xl px-4 py-3.5 text-left text-danger transition hover:bg-surface-raised"
            >
              Stop and close player
            </button>
          </li>
        </ul>
      </Sheet>
    </div>
  );
}

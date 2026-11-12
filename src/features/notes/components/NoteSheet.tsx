"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { seekTo } from "@/features/player/store/playerSlice";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import Sheet, { SheetTitle } from "@/shared/ui/modal/Sheet";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";
import { useGetNoteQuery } from "../api/notesApi";
import { useNoteAutosave, type AutosaveStatus } from "../hooks/useNoteAutosave";
import { docOf, NOTE_MAX_LENGTH } from "../lib/noteDoc";
import { editorContentFor, noteEditorExtensions } from "../lib/noteEditorExtensions";
import type { NoteDoc, SermonNote } from "../types";
import NoteFormatMenu from "./NoteFormatMenu";
import NoteMoreMenu from "./NoteMoreMenu";

interface NoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermon: Sermon;
  // Where playback is as the sheet opens: the moment a new note is for.
  atSeconds: number;
}

// One note per sermon, written like a Medium draft: straight onto the page, saved as you type,
// formatted from a toolbar over selected text, with Copy and Delete in a ⋯ menu.
export default function NoteSheet({ open, onOpenChange, sermon, atSeconds }: NoteSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <NotePanel sermon={sermon} atSeconds={atSeconds} onDone={() => onOpenChange(false)} />
    </Sheet>
  );
}

function NotePanel({ sermon, atSeconds, onDone }: { sermon: Sermon; atSeconds: number; onDone: () => void }) {
  const { data: note, isLoading } = useGetNoteQuery(sermon.id);

  if (isLoading || note === undefined) {
    return (
      <>
        <Heading sermon={sermon} />
        <SkeletonGroup label="Loading your note" className="mt-6 flex flex-col gap-2.5 py-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </SkeletonGroup>
      </>
    );
  }

  // Mounted once the note is known, so the editor starts from it (and later saves don't reset it).
  return <NoteEditor sermon={sermon} note={note} atSeconds={atSeconds} onDone={onDone} />;
}

function Heading({ sermon, moment, onJump }: { sermon: Sermon; moment?: number; onJump?: () => void }) {
  return (
    <div className="pr-14">
      <SheetTitle className="font-serif text-2xl text-foreground">Your note</SheetTitle>
      <p className="mt-1.5 text-sm text-muted">
        {sermon.title}
        {moment !== undefined && (
          <>
            {" · "}
            <button
              type="button"
              onClick={onJump}
              aria-label={`Play from ${formatPlaybackTime(moment)}`}
              className="font-medium text-brand-500 underline-offset-4 hover:underline"
            >
              at {formatPlaybackTime(moment)}
            </button>
          </>
        )}
      </p>
    </div>
  );
}

interface NoteEditorProps {
  sermon: Sermon;
  note: SermonNote | null;
  atSeconds: number;
  onDone: () => void;
}

function NoteEditor({ sermon, note, atSeconds, onDone }: NoteEditorProps) {
  const dispatch = useAppDispatch();
  // A note stays tied to the moment it was first written; a new one is for where playback is now.
  const [moment, setMoment] = useState(note?.atSeconds ?? atSeconds);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const autosave = useNoteAutosave({ sermonId: sermon.id, hasNote: Boolean(note), atSeconds: moment });

  // Worked out once, for the editor's starting content.
  const [initialContent] = useState(() => {
    const doc = docOf(note);
    return doc && note ? editorContentFor(doc, note.text) : undefined;
  });

  const editor = useEditor({
    extensions: noteEditorExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "note-prose min-h-48 py-2 focus:outline-none",
        "aria-label": "Your note",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) =>
      autosave.change({ text: current.getText({ blockSeparator: "\n" }).trim(), doc: current.getJSON() as NoteDoc }),
  });

  // A blank note is ready to type into; an existing one opens to be read, and a tap edits it.
  // Done here, once the editor exists, so it lands after the sheet's own opening focus.
  useEffect(() => {
    if (editor && !note) editor.commands.focus("end");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only as the editor first appears
  }, [editor]);

  const characters =
    useEditorState({
      editor,
      selector: ({ editor: current }) => (current ? (current.storage.characterCount.characters() as number) : 0),
    }) ?? 0;

  const jump = () => {
    dispatch(seekTo(moment));
    onDone();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(editor?.getText({ blockSeparator: "\n\n" }).trim() ?? "");
      toast.success("Note copied");
    } catch {
      toast.error("Couldn't copy your note.");
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await autosave.remove();
      editor?.commands.clearContent(false);
      setMoment(atSeconds);
      setConfirmingDelete(false);
      toast.success("Note deleted");
      editor?.commands.focus();
    } catch {
      toast.error("Couldn't delete your note. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const nearLimit = characters >= NOTE_MAX_LENGTH * 0.9;

  return (
    <>
      <Heading sermon={sermon} moment={moment} onJump={jump} />

      {/* Medium's draft bar: save state on the left, ⋯ on the right. */}
      <div className="mt-5 flex items-center justify-between gap-3 border-b border-border pb-2">
        <SaveState status={autosave.status} onRetry={() => void autosave.flush()} />
        <NoteMoreMenu
          disabled={autosave.status === "empty" || confirmingDelete}
          onCopy={() => void copy()}
          onDelete={() => setConfirmingDelete(true)}
        />
      </div>

      {confirmingDelete && (
        <div role="alertdialog" aria-labelledby="delete-note-question" className="mt-4 rounded-xl bg-ink/40 p-4">
          <p id="delete-note-question" className="text-sm text-foreground">
            Delete this note? This can&rsquo;t be undone.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* autoFocus on Cancel: the safe choice is the one a stray Enter presses. */}
            <Button type="button" variant="secondary" size="sm" autoFocus onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              onClick={() => void remove()}
              className="bg-danger text-ink hover:bg-danger/85 disabled:bg-danger/60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      )}

      {/* relative: the format toolbar positions itself within this box. */}
      <div className="relative mt-3">
        {editor ? (
          <>
            <EditorContent editor={editor} />
            <NoteFormatMenu editor={editor} />
          </>
        ) : (
          <div className="min-h-48" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className={cn("text-xs", nearLimit ? "text-danger" : "text-muted")}>
          {nearLimit
            ? `${characters.toLocaleString()}/${NOTE_MAX_LENGTH.toLocaleString()} characters`
            : "Select text to format it"}
        </p>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </>
  );
}

const STATUS_LABEL: Record<Exclude<AutosaveStatus, "error">, string> = {
  empty: "Saves as you type",
  unsaved: "Saving…",
  saving: "Saving…",
  saved: "Saved",
};

function SaveState({ status, onRetry }: { status: AutosaveStatus; onRetry: () => void }) {
  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-danger">
        Couldn&rsquo;t save.{" "}
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-4">
          Try again
        </button>
      </p>
    );
  }
  return <p className="text-sm text-muted">{STATUS_LABEL[status]}</p>;
}

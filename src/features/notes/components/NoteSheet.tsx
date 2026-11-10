"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { seekTo } from "@/features/player/store/playerSlice";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import { inputClasses, invalidInputClasses } from "@/shared/ui/form/inputStyles";
import Sheet, { SheetTitle } from "@/shared/ui/modal/Sheet";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";
import { useDeleteNoteMutation, useGetNoteQuery, useSaveNoteMutation } from "../api/notesApi";
import type { SermonNote } from "../types";

const MAX_LENGTH = 2000;

interface NoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermon: Sermon;
  // Where playback is as the sheet opens: the moment a new note is for.
  atSeconds: number;
}

// One note per sermon: "Add a note" when there isn't one, otherwise the note with Edit and Delete.
export default function NoteSheet({ open, onOpenChange, sermon, atSeconds }: NoteSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SermonNotePanel sermon={sermon} atSeconds={atSeconds} onDone={() => onOpenChange(false)} />
    </Sheet>
  );
}

// Mounted with the sheet, so it always opens on the note itself (never mid-edit from last time).
function SermonNotePanel({ sermon, atSeconds, onDone }: { sermon: Sermon; atSeconds: number; onDone: () => void }) {
  const { data: note, isLoading } = useGetNoteQuery(sermon.id);
  const [editing, setEditing] = useState(false);

  if (isLoading || note === undefined) {
    return (
      <>
        <Heading title="Your note" subtitle={sermon.title} />
        <SkeletonGroup label="Loading your note" className="mt-6 flex flex-col gap-2.5 rounded-xl bg-ink/40 p-4">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </SkeletonGroup>
      </>
    );
  }

  if (!note) {
    return (
      <>
        <Heading title="Add a note" subtitle={`${sermon.title} · at ${formatPlaybackTime(atSeconds)}`} />
        <NoteEditor sermonId={sermon.id} atSeconds={atSeconds} saveLabel="Save note" onCancel={onDone} onSaved={() => undefined} />
      </>
    );
  }

  if (editing) {
    return (
      <>
        <Heading title="Edit note" subtitle={`${sermon.title} · at ${formatPlaybackTime(note.atSeconds)}`} />
        <NoteEditor
          sermonId={sermon.id}
          // Editing keeps the note tied to the moment it was first written.
          atSeconds={note.atSeconds}
          initialText={note.text}
          saveLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </>
    );
  }

  return (
    <>
      <Heading title="Your note" subtitle={sermon.title} />
      <NoteCard note={note} onEdit={() => setEditing(true)} onJump={onDone} />
    </>
  );
}

// The sheet's heading (the sheet itself has no fixed title, since it changes with the state).
function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pr-14">
      <SheetTitle className="font-serif text-2xl text-foreground">{title}</SheetTitle>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

interface NoteEditorProps {
  sermonId: string;
  atSeconds: number;
  initialText?: string;
  saveLabel: string;
  onCancel: () => void;
  onSaved: () => void;
}

function NoteEditor({ sermonId, atSeconds, initialText = "", saveLabel, onCancel, onSaved }: NoteEditorProps) {
  const [saveNote, { isLoading }] = useSaveNoteMutation();
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Write something first.");
      return;
    }
    try {
      await saveNote({ sermonId, atSeconds: Math.round(atSeconds), text: trimmed }).unwrap();
      toast.success(initialText ? "Note updated" : "Note saved");
      onSaved();
    } catch {
      setError("Couldn't save your note. Try again.");
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="mt-6 flex flex-col gap-3"
    >
      <label htmlFor="note-text" className="sr-only">
        Your note
      </label>
      <textarea
        id="note-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={MAX_LENGTH}
        rows={5}
        autoFocus
        placeholder="Write your note here"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "note-error" : "note-count"}
        className={cn(inputClasses, "resize-none bg-transparent", error && invalidInputClasses)}
      />
      <div className="flex justify-between text-xs">
        <p id="note-error" className="text-danger">
          {error}
        </p>
        <p id="note-count" className="text-muted">
          {text.length}/{MAX_LENGTH}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Saving…" : saveLabel}
        </Button>
      </div>
    </form>
  );
}

interface NoteCardProps {
  note: SermonNote;
  onEdit: () => void;
  // After jumping playback to the note's moment, the sheet closes.
  onJump: () => void;
}

function NoteCard({ note, onEdit, onJump }: NoteCardProps) {
  const dispatch = useAppDispatch();
  const [deleteNote, { isLoading: deleting }] = useDeleteNoteMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const at = formatPlaybackTime(note.atSeconds);

  const remove = async () => {
    try {
      await deleteNote(note.sermonId).unwrap();
      toast.success("Note deleted");
    } catch {
      toast.error("Couldn't delete your note. Try again.");
      setConfirmingDelete(false);
    }
  };

  const iconButton =
    "flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised disabled:opacity-60";

  return (
    <article className="mt-6 rounded-xl bg-ink/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            dispatch(seekTo(note.atSeconds));
            onJump();
          }}
          aria-label={`Play from ${at}`}
          className="text-xs font-medium text-brand-500 underline-offset-4 hover:underline"
        >
          At {at}
        </button>
        {!confirmingDelete && (
          <div className="-my-2 -mr-2 flex items-center">
            <button type="button" onClick={onEdit} aria-label="Edit note" className={iconButton}>
              <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete note"
              className={cn(iconButton, "hover:text-danger")}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{note.text}</p>

      {/* Confirmed here, in the card, rather than in yet another sheet stacked over the player. */}
      {confirmingDelete && (
        <div role="alertdialog" aria-labelledby="delete-note-question" className="mt-4 border-t border-border pt-4">
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
    </article>
  );
}

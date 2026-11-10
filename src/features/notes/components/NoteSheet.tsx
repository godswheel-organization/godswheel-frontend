"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { seekTo } from "@/features/player/store/playerSlice";
import { formatPlaybackTime } from "@/features/sermons/lib/formatSermon";
import type { Sermon } from "@/features/sermons/types";
import { useAppDispatch } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import { inputClasses, invalidInputClasses } from "@/shared/ui/form/inputStyles";
import Sheet from "@/shared/ui/modal/Sheet";
import { Skeleton, SkeletonGroup } from "@/shared/ui/skeleton/Skeleton";
import { useAddNoteMutation, useGetNotesQuery } from "../api/notesApi";

const MAX_LENGTH = 2000;

interface NoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermon: Sermon;
  // The moment the note is for: where playback was when the sheet opened.
  atSeconds: number;
}

export default function NoteSheet({ open, onOpenChange, sermon, atSeconds }: NoteSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add a note"
      subtitle={`${sermon.title} · at ${formatPlaybackTime(atSeconds)}`}
    >
      <NoteEditor sermon={sermon} atSeconds={atSeconds} onDone={() => onOpenChange(false)} />
    </Sheet>
  );
}

function NoteEditor({ sermon, atSeconds, onDone }: { sermon: Sermon; atSeconds: number; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const { data: notes } = useGetNotesQuery(sermon.id);
  const [addNote, { isLoading }] = useAddNoteMutation();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Write something first.");
      return;
    }
    try {
      await addNote({ sermonId: sermon.id, atSeconds: Math.round(atSeconds), text: trimmed }).unwrap();
      setText("");
      setError(null);
      toast.success("Note saved");
    } catch {
      setError("Couldn't save your note. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="flex flex-col gap-3"
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
          <Button type="button" variant="secondary" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save note"}
          </Button>
        </div>
      </form>

      {!notes && (
        <SkeletonGroup label="Loading your notes" className="flex flex-col gap-3">
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col gap-2.5 rounded-xl bg-ink/40 p-4">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </SkeletonGroup>
      )}

      {notes && notes.length > 0 && (
        <section aria-labelledby="your-notes">
          <h3 id="your-notes" className="text-sm font-semibold text-foreground">
            Your notes for this sermon
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl bg-ink/40 p-4">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(seekTo(note.atSeconds));
                    onDone();
                  }}
                  className="text-xs font-medium text-brand-500 underline-offset-4 hover:underline"
                  aria-label={`Play from ${formatPlaybackTime(note.atSeconds)}`}
                >
                  At {formatPlaybackTime(note.atSeconds)}
                </button>
                <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{note.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

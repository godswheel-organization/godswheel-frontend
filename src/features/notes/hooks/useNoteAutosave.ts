"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDeleteNoteMutation, useSaveNoteMutation } from "../api/notesApi";
import type { NoteDoc } from "../types";

// How long typing has to pause before the note is saved.
const AUTOSAVE_DELAY_MS = 1000;

export type AutosaveStatus = "empty" | "unsaved" | "saving" | "saved" | "error";

export interface NoteDraft {
  text: string;
  doc: NoteDoc;
}

interface Options {
  sermonId: string;
  // Whether the sermon already has a note as the editor opens.
  hasNote: boolean;
  // The moment the note is for (it changes when a deleted note is started again).
  atSeconds: number;
}

// Medium-style saving: no Save button. Each change is saved once typing pauses, and anything still
// waiting is saved when the editor closes. Saves run one at a time, in order, so a slow request can
// never land after (and undo) a newer one. Erasing everything removes the note.
export function useNoteAutosave({ sermonId, hasNote, atSeconds }: Options) {
  const [saveNote] = useSaveNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [status, setStatus] = useState<AutosaveStatus>(hasNote ? "saved" : "empty");

  const pending = useRef<NoteDraft | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const stored = useRef(hasNote);
  // Read when a save runs, which can be after a re-render.
  const moment = useRef(atSeconds);
  useEffect(() => {
    moment.current = atSeconds;
  }, [atSeconds]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const draft = pending.current;
    if (!draft) return queue.current;
    pending.current = null;

    queue.current = queue.current.then(async () => {
      setStatus("saving");
      try {
        if (draft.text) {
          await saveNote({ sermonId, atSeconds: Math.round(moment.current), ...draft }).unwrap();
          stored.current = true;
        } else if (stored.current) {
          await deleteNote(sermonId).unwrap();
          stored.current = false;
        }
        if (!pending.current) setStatus(draft.text ? "saved" : "empty");
      } catch {
        // Keep it for the retry, unless something newer has been typed since.
        pending.current ??= draft;
        setStatus("error");
      }
    });
    return queue.current;
  }, [deleteNote, saveNote, sermonId]);

  const change = useCallback(
    (draft: NoteDraft) => {
      pending.current = draft;
      setStatus("unsaved");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    },
    [flush]
  );

  // Deletes the note outright, dropping anything not yet saved.
  const remove = useCallback(async () => {
    clearTimeout(timer.current);
    pending.current = null;
    await queue.current;
    await deleteNote(sermonId).unwrap();
    stored.current = false;
    setStatus("empty");
  }, [deleteNote, sermonId]);

  // Closing the sheet mid-sentence still saves it.
  useEffect(() => () => void flush(), [flush]);

  return { status, change, flush, remove };
}

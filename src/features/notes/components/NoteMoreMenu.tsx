"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy, Ellipsis, Trash2 } from "lucide-react";

interface NoteMoreMenuProps {
  // Nothing written yet: there's nothing to copy or delete.
  disabled: boolean;
  onCopy: () => void;
  onDelete: () => void;
}

const itemClasses =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition data-[highlighted]:bg-surface-raised";

// The ⋯ menu beside the note, as on a Medium draft.
export default function NoteMoreMenu({ disabled, onCopy, onDelete }: NoteMoreMenuProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        disabled={disabled}
        aria-label="More note options"
        className="flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-transparent data-[state=open]:bg-surface-raised"
      >
        <Ellipsis className="size-5" aria-hidden />
      </DropdownMenu.Trigger>
      {/* Not portalled: inside the sheet, so the sheet's focus trap and pointer lock leave it usable. */}
      <DropdownMenu.Content
        align="end"
        sideOffset={6}
        className="z-20 min-w-44 rounded-xl border border-border bg-surface-raised p-1 shadow-theme-xl motion-safe:animate-fade-in"
      >
        <DropdownMenu.Item onSelect={onCopy} className={`${itemClasses} text-foreground`}>
          <Copy className="size-4" aria-hidden />
          Copy text
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onDelete} className={`${itemClasses} text-danger`}>
          <Trash2 className="size-4" aria-hidden />
          Delete note
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

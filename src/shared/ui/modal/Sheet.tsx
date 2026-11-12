"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useReturnFocus } from "./useReturnFocus";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Omit for sheets that lay out their own heading: they must then render <SheetTitle> themselves,
  // so the visible heading is the one screen readers announce (e.g. the account prompt).
  title?: string;
  // A line under the title (e.g. "Arise and Shine · Prophet Grace Mensah").
  subtitle?: ReactNode;
  // Unmounted while closed, so any state inside starts fresh each time the sheet opens.
  children: ReactNode;
}

// A bottom sheet on phones and a centred dialog from md up. Radix handles focus trapping, Escape and
// scroll locking, and stacks correctly when one sheet opens over another (e.g. Bible over the player).
export default function Sheet({ open, onOpenChange, title, subtitle, children }: SheetProps) {
  const ownHeading = title === undefined;
  const returnFocus = useReturnFocus();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm motion-safe:data-[state=open]:animate-fade-in" />
        <Dialog.Content
          {...returnFocus}
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-theme-xl focus:outline-none motion-safe:data-[state=open]:animate-sheet-up md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:border md:p-6 md:motion-safe:data-[state=open]:animate-fade-in"
        >
          <div className={cn("flex items-start justify-between gap-4", ownHeading && "absolute right-4 top-4 md:right-5 md:top-5")}>
            {!ownHeading && (
              <div>
                <Dialog.Title className="font-serif text-2xl text-foreground">{title}</Dialog.Title>
                {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
              </div>
            )}
            <Dialog.Close
              aria-label="Close"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface-raised"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <div className={cn(!ownHeading && "mt-6")}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// The heading of a sheet that renders its own (see `title`).
export const SheetTitle = Dialog.Title;

"use client";

import Button from "@/shared/ui/button/Button";
import Sheet from "./Sheet";

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
}

// "Are you sure?" for actions that can't be undone (e.g. clearing listening history).
export default function ConfirmSheet({ open, onOpenChange, title, message, confirmLabel, onConfirm, busy }: ConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-muted">{message}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={busy}
          onClick={() => void onConfirm()}
          className="bg-danger text-ink hover:bg-danger/85 disabled:bg-danger/60"
        >
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}

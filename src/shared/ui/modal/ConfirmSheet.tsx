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
  // "danger" (coral) for actions that destroy something; "default" (brand orange) for ones you can undo, like signing out.
  tone?: "danger" | "default";
}

// "Are you sure?" before a significant action (e.g. clearing listening history, signing out).
export default function ConfirmSheet({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  onConfirm,
  busy,
  tone = "danger",
}: ConfirmSheetProps) {
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
          className={tone === "danger" ? "bg-danger text-ink hover:bg-danger/85 disabled:bg-danger/60" : undefined}
        >
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}

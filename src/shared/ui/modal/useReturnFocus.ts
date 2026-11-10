import { useRef } from "react";

// Radix dialogs only hand focus back automatically to their own <Dialog.Trigger>. Ours are opened from ordinary
// buttons (☰, Filters, Bible…), so this remembers what had focus as a dialog opens and returns it on close —
// keyboard and screen-reader users land back where they were. Spread onto <Dialog.Content>.
export function useReturnFocus() {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    onCloseAutoFocus: (event: Event) => {
      const target = opener.current;
      opener.current = null;
      // Skip if the opener is gone (e.g. the sheet's action navigated away); let the browser decide then.
      if (target?.isConnected) {
        event.preventDefault();
        target.focus();
      }
    },
  };
}

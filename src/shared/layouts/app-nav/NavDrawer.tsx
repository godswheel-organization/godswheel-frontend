"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Logo from "@/shared/ui/brand/Logo";
import { useReturnFocus } from "@/shared/ui/modal/useReturnFocus";
import { useAppNav } from "./AppNavProvider";
import NavPanel, { type NavPanelProps } from "./NavPanel";

// The ☰ button in the phone top bar. Hidden from md up, where the sidebar has its own.
export function MenuButton() {
  const { drawerOpen, setDrawerOpen } = useAppNav();
  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label="Open menu"
      aria-expanded={drawerOpen}
      aria-haspopup="dialog"
      className="-ml-2 flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface md:hidden"
    >
      <Menu className="size-6" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

// The phone menu: the sidebar's contents, sliding in from the left over a dimmed page (as YouTube Music does).
// Radix handles Escape and scroll locking; useReturnFocus puts focus back on ☰ when it closes.
export default function NavDrawer(props: NavPanelProps) {
  const { drawerOpen, setDrawerOpen } = useAppNav();
  const returnFocus = useReturnFocus();

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm motion-safe:data-[state=open]:animate-fade-in md:hidden" />
        <Dialog.Content
          {...returnFocus}
          aria-describedby={undefined}
          // Any link in the panel (tabs, topics, account) navigates, so close the drawer behind it.
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setDrawerOpen(false);
          }}
          className="no-scrollbar fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col overflow-y-auto border-r border-border bg-background px-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-theme-xl focus:outline-none motion-safe:data-[state=open]:animate-drawer-in md:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex items-center gap-2">
            <Dialog.Close
              aria-label="Close menu"
              className="flex size-11 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
            >
              <X className="size-6" strokeWidth={1.75} aria-hidden />
            </Dialog.Close>
            <Logo href={ROUTES.home} />
          </div>
          <NavPanel {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

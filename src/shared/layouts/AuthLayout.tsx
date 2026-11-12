import type { ReactNode } from "react";

// The form on its own on phones; from lg up, a brand panel beside it fills the empty half of the screen.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</div>
      </div>

      <aside aria-hidden className="relative hidden overflow-hidden border-l border-border bg-surface lg:flex lg:items-end lg:p-14">
        <div className="bg-brand-glow absolute inset-0" />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">GodsWheel</p>
          <p className="mt-4 font-serif text-5xl leading-tight text-foreground">Make room for the Word.</p>
          <p className="mt-4 text-lg text-muted">Save sermons to your library and pick up where you stopped.</p>
        </div>
      </aside>
    </div>
  );
}

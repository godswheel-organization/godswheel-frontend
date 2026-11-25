import type { ReactNode } from "react";
import Image from "next/image";
// Photo by Aaron Burden on Unsplash (https://unsplash.com/photos/VbcEb-Fkuzs), free under the Unsplash License.
import openBible from "@/assets/images/auth-open-bible.jpg";

// The form on its own on phones; from lg up, a photo panel fills the left half and the form sits on the right.
// The form stays first in the markup (keyboard and screen-reader order); only the visual order is swapped.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</div>
      </div>

      <aside aria-hidden className="relative hidden overflow-hidden border-r border-border bg-surface lg:order-first lg:flex lg:items-start lg:p-14">
        {/* Lazy (the default): phones never show this panel, so they never download the photo. */}
        <Image src={openBible} alt="" fill sizes="50vw" placeholder="blur" className="object-cover object-bottom" />
        {/* Darkens the top so the copy reads, and tints the photo toward the app's navy. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background/10" />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">GodsWheel</p>
          <p className="mt-4 font-serif text-5xl leading-tight text-foreground">Make room for the Word.</p>
          <p className="mt-4 text-lg text-muted">Save sermons to your library and pick up where you stopped.</p>
        </div>
        <p className="absolute bottom-4 right-5 text-xs text-white/60">Photo: Aaron Burden / Unsplash</p>
      </aside>
    </div>
  );
}

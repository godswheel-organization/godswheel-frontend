"use client";

import { usePathname } from "next/navigation";
import AccountPromptContent from "./AccountPromptContent";
import type { PromptKind } from "./promptCopy";

// What an account-only screen (Library, Settings) shows a guest: the same prompt as the sheet, inline.
export default function SignInGate({ kind }: { kind: Extract<PromptKind, "library" | "account"> }) {
  const pathname = usePathname();
  return (
    <div className="rounded-3xl border border-border bg-surface px-5 py-10 sm:px-10">
      <AccountPromptContent kind={kind} returnTo={pathname} className="mx-auto max-w-sm" />
    </div>
  );
}

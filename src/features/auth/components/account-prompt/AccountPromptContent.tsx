"use client";

import type { ElementType } from "react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import Button from "@/shared/ui/button/Button";
import { PROMPT_COPY, type PromptKind } from "./promptCopy";

interface AccountPromptContentProps {
  kind: PromptKind;
  // Where to come back to after signing in or up.
  returnTo: string;
  // Runs as either button is used (e.g. close the sheet before navigating away).
  onNavigate?: () => void;
  // What the title renders as: an h2 inline; the sheet passes SheetTitle so the heading names the dialog.
  titleAs?: ElementType;
  // "Not now" only makes sense where there's something to dismiss.
  onDismiss?: () => void;
  className?: string;
}

export default function AccountPromptContent({
  kind,
  returnTo,
  onNavigate,
  titleAs: Title = "h2",
  onDismiss,
  className,
}: AccountPromptContentProps) {
  const { icon: Icon, title, body } = PROMPT_COPY[kind];
  const withReturn = (path: string) => `${path}?redirectTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
        <Icon className="size-5" aria-hidden />
      </span>
      <Title className="mt-4 text-xl font-semibold text-foreground">{title}</Title>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{body}</p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <Button href={withReturn(ROUTES.signUp)} size="lg" className="w-full" onClick={onNavigate}>
          Create account
        </Button>
        <Button href={withReturn(ROUTES.signIn)} variant="secondary" size="lg" className="w-full" onClick={onNavigate}>
          Sign in
        </Button>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 text-sm text-foreground underline underline-offset-4 transition hover:text-brand-300"
        >
          Not now
        </button>
      )}
    </div>
  );
}

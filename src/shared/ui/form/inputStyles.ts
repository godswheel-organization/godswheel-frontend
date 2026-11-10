// Shared look for text-like controls. text-base (16px) stops iOS Safari zooming in on focus.
export const inputClasses =
  "block w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60";

export const invalidInputClasses = "border-danger focus:border-danger focus:ring-danger/30";

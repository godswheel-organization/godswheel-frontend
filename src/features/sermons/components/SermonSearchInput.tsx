"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { inputClasses } from "@/shared/ui/form/inputStyles";

const SEARCH_DELAY_MS = 300;

interface SermonSearchInputProps {
  // The search currently in the URL.
  value: string;
  onSearch: (query: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

// Searches as you type (debounced), or immediately on Enter. Keeps its own text so typing never
// waits on the URL, and adopts the URL's search only when it changes from elsewhere (e.g. Back).
export default function SermonSearchInput({
  value,
  onSearch,
  autoFocus,
  placeholder = "Search sermons, speakers",
  className,
}: SermonSearchInputProps) {
  const [text, setText] = useState(value);
  const [lastSeenValue, setLastSeenValue] = useState(value);
  const [lastSent, setLastSent] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adjusting state during render (not in an effect) is React's pattern for following a changing prop.
  if (value !== lastSeenValue) {
    setLastSeenValue(value);
    if (value !== lastSent) setText(value);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (query: string) => {
    clearTimeout(timer.current);
    setLastSent(query.trim());
    onSearch(query.trim());
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        send(text);
      }}
      className={cn("relative flex-1", className)}
    >
      <label htmlFor="sermon-search" className="sr-only">
        Search sermons and speakers
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        ref={inputRef}
        id="sermon-search"
        type="search"
        value={text}
        autoFocus={autoFocus}
        enterKeyHint="search"
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => send(next), SEARCH_DELAY_MS);
        }}
        // The browser's own clear button is hidden in favour of ours, which also clears the URL's search.
        className={cn(inputClasses, "bg-transparent pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none")}
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            send("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-foreground transition hover:bg-surface"
        >
          <X className="size-5" aria-hidden />
        </button>
      )}
    </form>
  );
}

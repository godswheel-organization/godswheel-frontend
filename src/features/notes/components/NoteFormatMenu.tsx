"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Heading2, Heading3, Italic, TextQuote, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FormatAction {
  label: string;
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

// Grouped as on Medium: inline styles, then block styles.
const GROUPS: FormatAction[][] = [
  [
    { label: "Bold", icon: Bold, isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  ],
  [
    {
      label: "Heading",
      icon: Heading2,
      isActive: (e) => e.isActive("heading", { level: 2 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      icon: Heading3,
      isActive: (e) => e.isActive("heading", { level: 3 }),
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Quote",
      icon: TextQuote,
      isActive: (e) => e.isActive("blockquote"),
      run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
  ],
];
const ACTIONS = GROUPS.flat();

// The toolbar that floats over selected text, like Medium's.
export default function NoteFormatMenu({ editor }: { editor: Editor }) {
  // Re-renders only when what's active changes, not on every keystroke.
  const active = useEditorState({ editor, selector: ({ editor: e }) => ACTIONS.map((action) => action.isActive(e)) });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8, flip: true, shift: { padding: 8 } }}
      role="toolbar"
      aria-label="Format text"
      className="z-10 flex items-center rounded-xl border border-border bg-ink p-1 shadow-theme-xl"
    >
      {GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className={cn("flex items-center", groupIndex > 0 && "ml-1 border-l border-border pl-1")}>
          {group.map((action) => {
            const isActive = active[ACTIONS.indexOf(action)];
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                aria-pressed={isActive}
                // Keeps the selection: a normal mousedown would move focus off the text first.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => action.run(editor)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition hover:bg-surface-raised",
                  isActive ? "text-brand-500" : "text-foreground"
                )}
              >
                <Icon className="size-4" strokeWidth={2} aria-hidden />
              </button>
            );
          })}
        </div>
      ))}
    </BubbleMenu>
  );
}

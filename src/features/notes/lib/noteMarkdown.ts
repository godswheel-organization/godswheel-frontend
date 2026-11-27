import type { NoteDoc, NoteDocNode } from "../types";

// The API stores a note as one string (PATCH /sermons/{id}/note { content }). Notes keep their formatting by
// being stored as Markdown: readable as plain text anywhere, and turned back into the editor's document here.
// Only what the note editor can make is covered: paragraphs, ## heading, ### subheading, > quote, - and 1. lists
// (nested), line breaks, **bold** and *italic*.

// ---------- Document → Markdown ----------

const escapeInline = (text: string) => text.replace(/([\\*_`])/g, "\\$1");

// Characters that would start a block if they began a line of text.
function escapeLineStart(line: string): string {
  return line
    .replace(/^(\s*)(#{1,6}\s|>|[-+]\s)/, (_match, space: string, marker: string) => `${space}\\${marker}`)
    .replace(/^(\s*\d+)([.)]\s)/, (_match, number: string, marker: string) => `${number}\\${marker}`);
}

function inlineMarkdown(nodes: NoteDocNode[] = []): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "hardBreak") {
      out += "\\\n";
      continue;
    }
    if (node.type !== "text" || !node.text) continue;
    const marks = new Set((node.marks ?? []).map((mark) => mark.type));
    // Delimiters hug the words: "** bold **" isn't bold in Markdown, so edge spaces go outside them.
    const [, lead, core, trail] = node.text.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? ["", "", node.text, ""];
    let text = escapeInline(core);
    if (text) {
      if (marks.has("italic")) text = `*${text}*`;
      if (marks.has("bold")) text = `**${text}**`;
    }
    out += lead + text + trail;
  }
  return out;
}

const prefixLines = (text: string, first: string, rest: string) =>
  text
    .split("\n")
    .map((line, index) => (index === 0 ? first : line ? rest : rest.trimEnd()) + line)
    .join("\n");

function blockMarkdown(node: NoteDocNode): string {
  switch (node.type) {
    case "paragraph":
      return inlineMarkdown(node.content)
        .split("\n")
        .map(escapeLineStart)
        .join("\n");
    case "heading":
      return `${(node.attrs?.level as number) >= 3 ? "###" : "##"} ${inlineMarkdown(node.content).replace(/\\\n/g, " ")}`;
    case "blockquote":
      return prefixLines(blocksMarkdown(node.content), "> ", "> ");
    case "bulletList":
    case "orderedList": {
      const start = typeof node.attrs?.start === "number" ? node.attrs.start : 1;
      return (node.content ?? [])
        .map((item, index) => {
          const marker = node.type === "bulletList" ? "- " : `${start + index}. `;
          return prefixLines(blocksMarkdown(item.content, "\n"), marker, " ".repeat(marker.length));
        })
        .join("\n");
    }
    default:
      return blocksMarkdown(node.content);
  }
}

// List items keep their blocks on consecutive lines; elsewhere blocks are separated by a blank line.
function blocksMarkdown(nodes: NoteDocNode[] = [], separator = "\n\n"): string {
  return nodes
    .map(blockMarkdown)
    .filter((text) => text.trim())
    .join(separator);
}

export const noteDocToMarkdown = (doc: NoteDoc): string => blocksMarkdown(doc.content).trim();

// ---------- Markdown → Document ----------

type Mark = { type: string };

function parseInline(source: string): NoteDocNode[] {
  const nodes: NoteDocNode[] = [];
  let bold = false;
  let italic: string | null = null;
  let buffer = "";

  const flush = () => {
    if (!buffer) return;
    const marks: Mark[] = [];
    if (bold) marks.push({ type: "bold" });
    if (italic) marks.push({ type: "italic" });
    nodes.push(marks.length ? { type: "text", text: buffer, marks } : { type: "text", text: buffer });
    buffer = "";
  };
  const isWordChar = (char: string | undefined) => Boolean(char && /[\p{L}\p{N}]/u.test(char));

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];
    if (char === "\\" && next === "\n") {
      flush();
      nodes.push({ type: "hardBreak" });
      i++;
    } else if (char === "\\" && next !== undefined && /[\\*_`#>\-+.!()[\]]/.test(next)) {
      buffer += next;
      i++;
    } else if (char === "*" && next === "*" && (bold || source.indexOf("**", i + 2) !== -1)) {
      flush();
      bold = !bold;
      i++;
    } else if (
      (char === "*" || char === "_") &&
      (italic === char || (!italic && source.indexOf(char, i + 1) !== -1)) &&
      // snake_case and 2*3 stay as written: _ and * only open before a word and close after one.
      (italic === char ? !isWordChar(next) || char === "*" : !isWordChar(source[i - 1]) || char === "*") &&
      (italic === char ? source[i - 1] !== " " : next !== " " && next !== char && next !== undefined)
    ) {
      flush();
      italic = italic ? null : char;
    } else {
      buffer += char === "\n" ? " " : char;
    }
  }
  flush();
  return nodes;
}

const paragraph = (text: string): NoteDocNode => {
  const content = parseInline(text);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
};

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*)$/;

function parseBlocks(lines: string[]): NoteDocNode[] {
  const blocks: NoteDocNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const content = parseInline(heading[2].trim());
      blocks.push({ type: "heading", attrs: { level: heading[1].length <= 2 ? 2 : 3 }, ...(content.length && { content }) });
      i++;
      continue;
    }

    if (/^\s{0,3}>/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s{0,3}>/.test(lines[i])) quoted.push(lines[i++].replace(/^\s{0,3}> ?/, ""));
      blocks.push({ type: "blockquote", content: nonEmpty(parseBlocks(quoted)) });
      continue;
    }

    const item = line.match(LIST_ITEM);
    if (item) {
      const [list, after] = parseList(lines, i, item[1].length);
      blocks.push(list);
      i = after;
      continue;
    }

    // A paragraph runs until a blank line or the start of another block. A line ending in "\" breaks the line.
    const text: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !HEADING.test(lines[i]) && !/^\s{0,3}>/.test(lines[i]) && !LIST_ITEM.test(lines[i])) {
      text.push(lines[i++]);
    }
    blocks.push(paragraph(text.map((part) => part.trim()).join("\n")));
  }
  return blocks;
}

// A list starting at `start`, whose markers sit at `indent`. Lines indented further belong to its items (more
// text, or a nested list). Returns the list and the index of the first line after it.
function parseList(lines: string[], start: number, indent: number): [NoteDocNode, number] {
  const ordered = /\d/.test(lines[start].match(LIST_ITEM)![2]);
  const items: NoteDocNode[] = [];
  let i = start;
  while (i < lines.length) {
    const match = lines[i].match(LIST_ITEM);
    if (!match || match[1].length !== indent || /\d/.test(match[2]) !== ordered) break;
    const body = [match[3]];
    const contentIndent = indent + match[2].length + 1;
    i++;
    // The item's own lines: indented past its marker, or blank lines followed by such.
    while (i < lines.length) {
      const current = lines[i];
      const leading = current.match(/^\s*/)![0].length;
      if (current.trim() && leading > indent) {
        body.push(current.slice(Math.min(leading, contentIndent)));
        i++;
      } else if (!current.trim() && lines[i + 1] !== undefined && lines[i + 1].trim() && lines[i + 1].match(/^\s*/)![0].length > indent) {
        body.push("");
        i++;
      } else {
        break;
      }
    }
    items.push({ type: "listItem", content: nonEmpty(parseBlocks(body)) });
  }
  const first = Number.parseInt(lines[start].match(LIST_ITEM)![2], 10);
  const list: NoteDocNode = ordered
    ? { type: "orderedList", attrs: { start: Number.isNaN(first) ? 1 : first }, content: items }
    : { type: "bulletList", content: items };
  return [list, i];
}

// Quotes and list items must hold at least one block.
const nonEmpty = (blocks: NoteDocNode[]) => (blocks.length ? blocks : [{ type: "paragraph" }]);

export function markdownToNoteDoc(markdown: string): NoteDoc {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  return { type: "doc", content: nonEmpty(parseBlocks(lines)) };
}

// ---------- Plain text ----------

// The note as plain text (previews, copying, the character limit): one line per block, as the editor's
// getText({ blockSeparator: "\n" }) gives it.
export function noteDocToText(doc: NoteDocNode): string {
  const lines: string[] = [];
  const walk = (node: NoteDocNode) => {
    if (node.type === "paragraph" || node.type === "heading") {
      lines.push((node.content ?? []).map((child) => (child.type === "hardBreak" ? "\n" : (child.text ?? ""))).join(""));
    } else {
      (node.content ?? []).forEach(walk);
    }
  };
  walk(doc);
  return lines.join("\n").trim();
}

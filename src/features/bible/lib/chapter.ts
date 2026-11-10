// "Isaiah 60:1" → "Isaiah 60"; "1 Samuel 3:9-10" → "1 Samuel 3"; "Jude" → "Jude".
export function chapterOf(reference: string): string {
  return reference.trim().replace(/:\d+(?:[-–]\d+)?$/, "");
}

// "Open full chapter": the chapter on Bible Gateway, in the chosen version.
// TODO(backend): point at the app's own reader if one is built.
export function fullChapterUrl(reference: string, version: string): string {
  const params = new URLSearchParams({ search: chapterOf(reference), version });
  return `https://www.biblegateway.com/passage/?${params}`;
}

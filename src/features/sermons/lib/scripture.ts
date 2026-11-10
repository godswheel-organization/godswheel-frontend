// "1 Samuel 3:10" → "1 Samuel", "Psalm 30:5-7" → "Psalm", "Jude" → "Jude".
export function scriptureBook(reference: string): string {
  const trimmed = reference.trim();
  const match = trimmed.match(/^(.*?)\s+\d+(?::\d+(?:[-–]\d+)?)?$/);
  return match ? match[1] : trimmed;
}

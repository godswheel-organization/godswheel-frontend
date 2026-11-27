// The 66 books, in canon order: the Scripture filter's choices (GET /sermons?scripture=<book>).
// The API has no list of the books its sermons use, so every book is offered.
export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
] as const;

// What the API's scripture filter matches each book by, where that differs from its name: its sermons cite
// "Psalm 23", and ?scripture=Psalms finds none of them.
const API_BOOK_NAMES: Partial<Record<string, string>> = { Psalms: "Psalm" };

export const apiBookName = (book: string) => API_BOOK_NAMES[book] ?? book;

// The same for a typed reference: "Psalms 23" → "Psalm 23".
export const apiScripture = (reference: string) => reference.trim().replace(/^psalms\b/i, "Psalm");

// Whether a search looks like a passage: a book's name, maybe with a chapter and verses ("romans", "John 3:16").
// The Search tab's "All" only asks the API's scripture filter then.
export function isScriptureSearch(query: string): boolean {
  const match = query.trim().match(/^(.+?)(?:\s+\d+(?::\d+(?:\s*[-–]\s*\d+)?)?)?$/);
  if (!match) return false;
  const book = match[1].toLowerCase().replace(/\s+/g, " ");
  return BIBLE_BOOKS.some((name) => name.toLowerCase() === book) || book === "psalm";
}

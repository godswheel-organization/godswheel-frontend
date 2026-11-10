// Shared RTK Query tag-type constants, reused across every feature's api slice.
export const API_TAGS = {
  Auth: "Auth",
  Sermon: "Sermon",
  Library: "Library",
  History: "History",
  Notes: "Notes",
  Settings: "Settings",
} as const;

export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];

// Shared RTK Query tag-type constants, reused across every feature's api slice.
export const API_TAGS = {
  Auth: "Auth",
} as const;

export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];

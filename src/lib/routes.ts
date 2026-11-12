// Every app URL in one place, so links never drift from the route folders under src/app.
export const ROUTES = {
  // Marketing landing page (signed-out visitors) vs. the app's own home tab.
  landing: "/",
  home: "/home",
  sermons: "/sermons",
  sermon: (id: string) => `/sermons/${id}`,
  reportSermon: (id: string) => `/report?sermon=${encodeURIComponent(id)}`,
  sermonsByTopic: (topic: string) => `/sermons?topic=${encodeURIComponent(topic)}`,
  search: "/search",
  library: "/library",
  librarySaved: "/library/saved",
  libraryHistory: "/library/history",
  settings: "/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  about: "/about",
  report: "/report",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
} as const;

// Sends a signed-out visitor to sign-in, then back to where they were.
export function signInThenReturnTo(path: string): string {
  return `${ROUTES.signIn}?redirectTo=${encodeURIComponent(path)}`;
}

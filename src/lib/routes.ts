// Every app URL in one place, so links never drift from the route folders under src/app.
export const ROUTES = {
  // Marketing landing page (signed-out visitors) vs. the app's own home tab.
  landing: "/",
  home: "/home",
  sermons: "/sermons",
  sermon: (id: string) => `/sermons/${id}`,
  reportSermon: (id: string) => `/report?sermon=${encodeURIComponent(id)}`,
  // Browse filtered to one category (its API slug).
  sermonsByCategory: (slug: string) => `/sermons?category=${encodeURIComponent(slug)}`,
  search: "/search",
  library: "/library",
  librarySaved: "/library/saved",
  libraryHistory: "/library/history",
  settings: "/settings",
  changePassword: "/settings/password",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  // Where the verification email's link lands: /verify-email?token=…
  verifyEmail: "/verify-email",
  // Where the password-reset email's link lands: /reset-password?token=…
  resetPassword: "/reset-password",
  about: "/about",
  report: "/report",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
} as const;

// Sends a signed-out visitor to sign-in, then back to where they were.
export function signInThenReturnTo(path: string): string {
  return `${ROUTES.signIn}?redirectTo=${encodeURIComponent(path)}`;
}

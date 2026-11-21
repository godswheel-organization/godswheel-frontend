import { toApiError } from "@/lib/api/apiError";

type AuthAction = "signIn" | "signUp";

// Turns a failed auth call into one sentence the user can act on. Never echoes server text verbatim.
export function authErrorMessage(error: unknown, action: AuthAction): string {
  const { status, code } = toApiError(error);

  if (code === "network_error") return "We couldn't reach GodsWheel. Check your connection and try again.";
  if (status === 429) return "Too many attempts. Wait a few minutes, then try again.";
  if (action === "signIn" && isUnverifiedSignIn(error)) {
    return "Verify your email first: open the link we sent when you signed up, then sign in.";
  }
  if (action === "signIn" && (status === 400 || status === 401)) return "That email and password don't match. Try again.";
  if (action === "signIn" && status === 422) return "Enter a valid email address and your password.";
  if (action === "signUp" && status === 409) return "An account with this email already exists. Sign in instead.";
  return "Something went wrong on our side. Please try again.";
}

// The API refuses sign-in (403) until the account's email address is verified.
export function isUnverifiedSignIn(error: unknown): boolean {
  const { status, code } = toApiError(error);
  return status === 403 || code === "email_not_verified";
}

// Password reset must not reveal whether an account exists: "no such account" (404) is reported as success,
// exactly like a real send. Returns null when the user should see "check your email".
export function passwordResetErrorMessage(error: unknown): string | null {
  const { status, code } = toApiError(error);

  if (status === 404) return null;
  if (code === "network_error") return "We couldn't reach GodsWheel. Check your connection and try again.";
  if (status === 429) return "Too many requests. Wait a few minutes, then try again.";
  if (status === 400 || status === 422) return "Enter a valid email address.";
  return "Something went wrong on our side. Please try again.";
}

export type ResetPasswordFailure =
  // The new password was turned down: show it on the field.
  | { kind: "password"; message: string }
  // The link can't be used (invalid, expired or already spent): ask for a new one.
  | { kind: "link" }
  // Couldn't finish (connection, server error): the link may still be good, so try again.
  | { kind: "retry"; message: string };

// A failed password reset. The API answers 422 for both a bad token and a bad password; its details say which.
export function resetPasswordFailure(error: unknown): ResetPasswordFailure {
  const { status, code, details } = toApiError(error);

  if (code === "network_error") return { kind: "retry", message: "We couldn't reach GodsWheel. Check your connection and try again." };
  if (status === 429) return { kind: "retry", message: "Too many attempts. Wait a few minutes, then try again." };
  if (status === 422 || status === 400) {
    if (details?.password) return { kind: "password", message: "Password must be 8 to 72 characters" };
    return { kind: "link" };
  }
  return { kind: "retry", message: "Something went wrong on our side. Try again, or request a new link." };
}

// A failed password change, pointed at the field the user needs to fix (or the whole form).
export function changePasswordErrorMessage(error: unknown): {
  field?: "currentPassword" | "newPassword";
  message: string;
} {
  const { status, code, details } = toApiError(error);

  if (code === "network_error") return { message: "We couldn't reach GodsWheel. Check your connection and try again." };
  // The API answers 403 for a wrong current password (401 is kept for a missing or expired session).
  if (status === 403 || code === "incorrect_password") return { field: "currentPassword", message: "That's not your current password" };
  if (code === "password_reused") return { field: "newPassword", message: "Choose a password you haven't used before" };
  if (status === 401) return { message: "Your session has ended. Sign in again, then change your password." };
  if (status === 429) return { message: "Too many attempts. Wait a few minutes, then try again." };
  if (status === 422 || status === 400) {
    // Validation details name the field, in either key style.
    if (details?.new_password || details?.newPassword) return { field: "newPassword", message: "Password must be 8 to 72 characters" };
    if (details?.current_password || details?.currentPassword) return { field: "currentPassword", message: "Enter your current password" };
    return { message: "Some details weren't accepted. Check them and try again." };
  }
  return { message: "Something went wrong on our side. Please try again." };
}

export type SignUpField = "firstName" | "lastName" | "email" | "password" | "termsAccepted";

const EMAIL_TAKEN = "An account with this email already exists. Sign in instead.";

// A failed sign-up, as messages for the fields to fix (plus one for the whole form when no field fits).
// The API's own wording ("has invalid format") is never shown: each field gets our sentence instead.
export function signUpErrors(error: unknown): { fields: Partial<Record<SignUpField, string>>; form?: string } {
  const { status, code, details } = toApiError(error);

  if (code === "network_error") return { fields: {}, form: "We couldn't reach GodsWheel. Check your connection and try again." };
  if (status === 429) return { fields: {}, form: "Too many attempts. Wait a few minutes, then try again." };
  if (status === 409 || code === "email_taken" || code === "conflict") return { fields: { email: EMAIL_TAKEN } };

  const fields: Partial<Record<SignUpField, string>> = {};
  for (const [field, messages] of Object.entries(details ?? {})) {
    const said = messages.join(" ").toLowerCase();
    if (field === "email") fields.email = /taken|exists|registered|in use/.test(said) ? EMAIL_TAKEN : "Enter a valid email address";
    else if (field === "password") fields.password = "Password must be 8 to 72 characters";
    else if (field === "fullName" || field === "full_name") fields.firstName = "Enter your first and last name";
    else if (field === "acceptedTerms" || field === "accepted_terms") fields.termsAccepted = "Agree to the Terms and Privacy notice to continue";
  }
  if (Object.keys(fields).length) return { fields };
  if (status === 422 || status === 400) return { fields: {}, form: "Some details weren't accepted. Check them and try again." };
  return { fields: {}, form: "Something went wrong on our side. Please try again." };
}

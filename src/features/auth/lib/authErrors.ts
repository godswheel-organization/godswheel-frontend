import { toApiError } from "@/lib/api/apiError";

type AuthAction = "signIn" | "signUp";

// Turns a failed auth call into one sentence the user can act on. Never echoes server text verbatim.
export function authErrorMessage(error: unknown, action: AuthAction): string {
  const { status, code } = toApiError(error);

  if (code === "network_error") return "We couldn't reach GodsWheel. Check your connection and try again.";
  if (status === 429) return "Too many attempts. Wait a few minutes, then try again.";
  if (action === "signIn" && (status === 400 || status === 401)) return "That email and password don't match. Try again.";
  if (action === "signUp" && status === 409) return "An account with this email already exists. Sign in instead.";
  return "Something went wrong on our side. Please try again.";
}

// Password reset must not reveal whether an account exists: "no such account" (404) is reported as success,
// exactly like a real send. Returns null when the user should see "check your email".
export function passwordResetErrorMessage(error: unknown): string | null {
  const { status, code } = toApiError(error);

  if (status === 404) return null;
  if (code === "network_error") return "We couldn't reach GodsWheel. Check your connection and try again.";
  if (status === 429) return "Too many requests. Wait a few minutes, then try again.";
  if (status === 400) return "Enter a valid email address.";
  return "Something went wrong on our side. Please try again.";
}

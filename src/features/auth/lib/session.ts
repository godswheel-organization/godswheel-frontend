import type { AuthSession, PublicUser } from "../types";

// The API keeps one full name; the app greets and labels people by first and last name.
export function toAuthSession(user: PublicUser): AuthSession {
  const [firstName = "", ...rest] = user.fullName.trim().split(/\s+/);
  return { userId: user.id, firstName, lastName: rest.join(" "), email: user.email };
}

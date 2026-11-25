import type { AuthSession, PublicUser } from "../types";

type NamedUser = Pick<PublicUser, "id" | "fullName" | "email">;

// The API keeps one full name; the app greets and labels people by first and last name.
export function toAuthSession(user: NamedUser): AuthSession {
  const [firstName = "", ...rest] = user.fullName.trim().split(/\s+/);
  return { userId: user.id, firstName, lastName: rest.join(" "), email: user.email };
}

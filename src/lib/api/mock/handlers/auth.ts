import type { AuthSession } from "@/features/auth/types";
import { fail, field, noContent, ok, text, type MockRoute } from "../http";
import { hashPassword } from "../password";
import { DEFAULT_SETTINGS } from "../records";

// How many earlier passwords a new one is checked against.
const PASSWORD_HISTORY = 5;

const toSession = (user: { id: string; firstName: string; lastName: string; email: string }): AuthSession => ({
  userId: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});

export const authRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/auth/login",
    async handle({ body }, { db }) {
      const email = text(field(body, "email")).toLowerCase();
      const password = typeof field(body, "password") === "string" ? (field(body, "password") as string) : "";
      const user = (await db.users.all()).find((candidate) => candidate.email === email);
      // One answer for "no such user" and "wrong password", as a real backend should give.
      if (!user || user.passwordHash !== hashPassword(password)) return fail(401, "invalid_credentials");
      await db.session.start(user.id);
      return noContent();
    },
  },
  {
    method: "POST",
    path: "/auth/register",
    async handle({ body }, { db, now }) {
      const firstName = text(field(body, "firstName"));
      const lastName = text(field(body, "lastName"));
      const email = text(field(body, "email")).toLowerCase();
      const password = field(body, "password");
      if (!firstName || !lastName || !email.includes("@") || typeof password !== "string" || password.length < 8) {
        return fail(400, "bad_request", "First name, last name, a valid email and an 8+ character password are required.");
      }
      if (field(body, "termsAccepted") !== true) return fail(400, "bad_request", "The terms must be accepted.");

      const users = await db.users.all();
      if (users.some((user) => user.email === email)) return fail(409, "email_taken");

      const user = {
        id: `user_${crypto.randomUUID()}`,
        firstName,
        lastName,
        email,
        passwordHash: hashPassword(password),
        createdAt: now().toISOString(),
      };
      await db.users.save([...users, user]);
      await db.settings.save(user.id, DEFAULT_SETTINGS);
      await db.session.start(user.id);
      return ok(null, 201);
    },
  },
  {
    method: "GET",
    path: "/auth/session",
    async handle(_request, { db, userId }) {
      const user = userId ? (await db.users.all()).find((candidate) => candidate.id === userId) : undefined;
      return user ? ok(toSession(user)) : fail(401, "unauthenticated");
    },
  },
  {
    method: "POST",
    path: "/auth/logout",
    async handle(_request, { db }) {
      await db.session.end();
      return noContent();
    },
  },
  {
    method: "POST",
    path: "/auth/password/change",
    auth: true,
    async handle({ body }, { db, userId }) {
      const currentPassword = field(body, "currentPassword");
      const newPassword = field(body, "newPassword");
      if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
        return fail(400, "bad_request", "The current password and an 8–128 character new password are required.");
      }

      const users = await db.users.all();
      const user = users.find((candidate) => candidate.id === userId);
      if (!user) return fail(401, "unauthenticated");
      // 403, not 401: the session is fine, only the password typed is wrong (a 401 would sign the user out).
      if (user.passwordHash !== hashPassword(currentPassword)) return fail(403, "incorrect_password");

      const newHash = hashPassword(newPassword);
      const used = [user.passwordHash, ...(user.previousPasswordHashes ?? [])];
      if (used.includes(newHash)) return fail(422, "password_reused");

      const updated = { ...user, passwordHash: newHash, previousPasswordHashes: used.slice(0, PASSWORD_HISTORY) };
      await db.users.save(users.map((candidate) => (candidate.id === userId ? updated : candidate)));
      return noContent();
    },
  },
  {
    // Accepted whether or not the email has an account, so the endpoint can't be used to find accounts.
    method: "POST",
    path: "/auth/password/forgot",
    handle: () => ok(null, 202),
  },
];

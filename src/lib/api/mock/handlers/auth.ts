import type { AuthSession } from "@/features/auth/types";
import { fail, field, noContent, ok, text, type MockRoute } from "../http";
import { hashPassword } from "../password";
import { DEFAULT_SETTINGS } from "../records";

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
    // Accepted whether or not the email has an account, so the endpoint can't be used to find accounts.
    method: "POST",
    path: "/auth/password/forgot",
    handle: () => ok(null, 202),
  },
];

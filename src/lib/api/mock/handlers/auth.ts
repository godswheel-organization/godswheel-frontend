import type { AuthSession } from "@/features/auth/types";
import { fail, field, noContent, ok, text, type MockRoute, type MockResponse } from "../http";
import { hashPassword } from "../password";
import { DEFAULT_SETTINGS } from "../records";

// The live API's validation error: 422 { success: false, error: { code, message, details } }.
const validationError = (details: Record<string, string[]>): MockResponse => ({
  status: 422,
  data: { success: false, error: { code: "validation_error", message: "The submitted account details are invalid.", details } },
});

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
      // Accounts made through sign-up can't sign in until their email is verified (the demo account is).
      if (user.emailVerified === false) return fail(403, "email_not_verified");
      await db.session.start(user.id);
      return noContent();
    },
  },
  {
    // Mirrors the live POST /auth/signup (which the app now calls for real; see LIVE_ENDPOINTS in baseQuery.ts):
    // an unverified account, no session, and the API's { success, data } / { success, error } envelopes.
    method: "POST",
    path: "/auth/signup",
    async handle({ body }, { db, now }) {
      const fullName = text(field(body, "full_name"));
      const email = text(field(body, "email")).toLowerCase();
      const password = field(body, "password");
      const details: Record<string, string[]> = {};
      if (fullName.length < 2 || fullName.length > 120) details.fullName = ["should be 2 to 120 character(s)"];
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) details.email = ["has invalid format"];
      if (typeof password !== "string" || password.length < 8 || password.length > 72) details.password = ["should be 8 to 72 character(s)"];
      if (field(body, "accepted_terms") !== true) details.acceptedTerms = ["must be accepted"];

      const users = await db.users.all();
      if (!details.email && users.some((user) => user.email === email)) details.email = ["has already been taken"];
      if (Object.keys(details).length) return validationError(details);

      const [firstName, ...rest] = fullName.split(/\s+/);
      const user = {
        id: `user_${crypto.randomUUID()}`,
        firstName,
        lastName: rest.join(" "),
        email,
        passwordHash: hashPassword(password as string),
        emailVerified: false,
        createdAt: now().toISOString(),
      };
      await db.users.save([...users, user]);
      await db.settings.save(user.id, DEFAULT_SETTINGS);
      return ok(
        {
          success: true,
          data: {
            message: "Account created. Check your email to verify your address.",
            user: { id: user.id, fullName, email, emailVerified: false },
          },
        },
        201
      );
    },
  },
  {
    // The same answer whether or not an unverified account exists, so it can't be used to find accounts.
    method: "POST",
    path: "/auth/resend-verification",
    handle: ({ body }) =>
      typeof field(body, "email") === "string"
        ? ok({ success: true, data: { message: "If the account needs verifying, a new link is on its way." } })
        : validationError({ email: ["can't be blank"] }),
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
    // Mirrors the live PUT /auth/change-password (which the app now calls instead).
    method: "PUT",
    path: "/auth/change-password",
    auth: true,
    async handle({ body }, { db, userId }) {
      const currentPassword = field(body, "current_password");
      const newPassword = field(body, "new_password");
      if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 72) {
        return fail(422, "validation_error", "The current password and an 8–72 character new password are required.");
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
    path: "/auth/forgot-password",
    handle: () => ok(null, 202),
  },
];

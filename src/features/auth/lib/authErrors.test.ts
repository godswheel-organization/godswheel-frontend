import { describe, expect, it } from "vitest";
import { authErrorMessage, passwordResetErrorMessage } from "./authErrors";

describe("authErrorMessage", () => {
  it("explains an unreachable server", () => {
    expect(authErrorMessage({ status: "FETCH_ERROR", error: "TypeError: Failed to fetch" }, "signIn")).toMatch(
      /couldn't reach/
    );
  });

  it("tells sign-in apart from sign-up", () => {
    expect(authErrorMessage({ status: 401, data: {} }, "signIn")).toMatch(/don't match/);
    expect(authErrorMessage({ status: 409, data: {} }, "signUp")).toMatch(/already exists/);
  });

  it("falls back for anything else", () => {
    expect(authErrorMessage({ status: 500, data: { message: "stack trace…" } }, "signUp")).toMatch(/our side/);
  });
});

describe("passwordResetErrorMessage", () => {
  it("treats an unknown email as sent, so the form never reveals who has an account", () => {
    expect(passwordResetErrorMessage({ status: 404, data: { error: "not_found" } })).toBeNull();
  });

  it("still reports problems the user can act on", () => {
    expect(passwordResetErrorMessage({ status: "FETCH_ERROR", error: "Failed to fetch" })).toMatch(/couldn't reach/);
    expect(passwordResetErrorMessage({ status: 429, data: {} })).toMatch(/Too many/);
  });
});

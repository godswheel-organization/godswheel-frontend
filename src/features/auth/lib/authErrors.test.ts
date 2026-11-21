import { describe, expect, it } from "vitest";
import {
  authErrorMessage,
  changePasswordErrorMessage,
  passwordResetErrorMessage,
  resetPasswordFailure,
  signUpErrors,
} from "./authErrors";

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

describe("unverified sign-in", () => {
  it("asks the user to verify their email first", () => {
    expect(authErrorMessage({ status: 403, data: { error: "email_not_verified" } }, "signIn")).toMatch(/Verify your email/);
  });
});

describe("signUpErrors", () => {
  const validation = (details: Record<string, string[]>) => ({
    status: 422,
    data: { success: false, error: { code: "validation_error", message: "The submitted account details are invalid.", details } },
  });

  it("puts each validation message on its own field, in our words", () => {
    expect(signUpErrors(validation({ email: ["has invalid format"], acceptedTerms: ["must be accepted"] }))).toEqual({
      fields: { email: "Enter a valid email address", termsAccepted: "Agree to the Terms and Privacy notice to continue" },
    });
    expect(signUpErrors(validation({ fullName: ["should be at least 2 character(s)"], password: ["too short"] }))).toEqual({
      fields: { firstName: "Enter your first and last name", password: "Password must be 8 to 72 characters" },
    });
  });

  it("tells the user when the email already has an account", () => {
    expect(signUpErrors(validation({ email: ["has already been taken"] })).fields.email).toMatch(/already exists/);
    expect(signUpErrors({ status: 409, data: {} }).fields.email).toMatch(/already exists/);
  });

  it("falls back to one message for the form", () => {
    expect(signUpErrors(validation({})).form).toMatch(/weren't accepted/);
    expect(signUpErrors({ status: 500, data: { success: false, error: { code: "internal_server_error" } } }).form).toMatch(/our side/);
    expect(signUpErrors({ status: "FETCH_ERROR", error: "Failed to fetch" }).form).toMatch(/couldn't reach/);
  });
});

describe("resetPasswordFailure", () => {
  const unprocessable = (details: Record<string, string[]> | null, code = "validation_error") => ({
    status: 422,
    data: { success: false, error: { code, message: "", details } },
  });

  it("puts a rejected password on the field", () => {
    expect(resetPasswordFailure(unprocessable({ password: ["should be at least 8 character(s)"] }))).toEqual({
      kind: "password",
      message: "Password must be 8 to 72 characters",
    });
  });

  it("treats any other 422 as a link that can't be used", () => {
    expect(resetPasswordFailure(unprocessable(null, "invalid_or_expired_token"))).toEqual({ kind: "link" });
  });

  it("offers a retry when the server or connection fails (the link may still be good)", () => {
    expect(resetPasswordFailure({ status: 500, data: { success: false, error: { code: "internal_server_error" } } })).toMatchObject({ kind: "retry" });
    expect(resetPasswordFailure({ status: "FETCH_ERROR", error: "Failed to fetch" })).toMatchObject({
      kind: "retry",
      message: expect.stringMatching(/couldn't reach/),
    });
  });
});

describe("changePasswordErrorMessage", () => {
  const apiError = (status: number, code: string, details: Record<string, string[]> | null = null) => ({
    status,
    data: { success: false, error: { code, message: "", details } },
  });

  it("puts a wrong current password (403) on that field", () => {
    expect(changePasswordErrorMessage(apiError(403, "invalid_current_password"))).toEqual({
      field: "currentPassword",
      message: "That's not your current password",
    });
  });

  it("puts a rejected new password (422) on its field, in either key style", () => {
    const expected = { field: "newPassword", message: "Password must be 8 to 72 characters" };
    expect(changePasswordErrorMessage(apiError(422, "validation_error", { new_password: ["too short"] }))).toEqual(expected);
    expect(changePasswordErrorMessage(apiError(422, "validation_error", { newPassword: ["too short"] }))).toEqual(expected);
  });

  it("says when the session has ended (401) instead of blaming the password", () => {
    expect(changePasswordErrorMessage(apiError(401, "authentication_required"))).toEqual({
      message: expect.stringMatching(/session has ended/),
    });
  });

  it("falls back to a form-level message for server and connection failures", () => {
    expect(changePasswordErrorMessage(apiError(500, "internal_server_error")).message).toMatch(/our side/);
    expect(changePasswordErrorMessage({ status: "FETCH_ERROR", error: "Failed to fetch" }).message).toMatch(/couldn't reach/);
  });
});

import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./auth.schema";

const errorsFor = (values: { currentPassword: string; newPassword: string }) => {
  const result = changePasswordSchema.safeParse(values);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
};

describe("changePasswordSchema", () => {
  it("accepts a current password and a new 8+ character one", () => {
    expect(errorsFor({ currentPassword: "anything", newPassword: "brand-new-pass" })).toEqual({});
  });

  it("asks for both, and 8+ characters for the new one", () => {
    expect(errorsFor({ currentPassword: "", newPassword: "short" })).toEqual({
      currentPassword: "Enter your current password",
      newPassword: "Password must be at least 8 characters",
    });
  });

  it("turns down the current password as the new one", () => {
    expect(errorsFor({ currentPassword: "same-password", newPassword: "same-password" })).toEqual({
      newPassword: "Choose a password you haven't used before",
    });
  });
});

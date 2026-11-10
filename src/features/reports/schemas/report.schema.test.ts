import { describe, expect, it } from "vitest";
import { reportSchema } from "./report.schema";

const errorsOf = (values: unknown) => {
  const result = reportSchema.safeParse(values);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join("."), issue.message]));
};

describe("reportSchema", () => {
  it("needs a reason", () => {
    expect(errorsOf({ details: "", email: "" })).toEqual({ reason: "Choose what the issue is" });
  });

  it("lets a named reason go without details or email", () => {
    expect(errorsOf({ reason: "wrong_information", details: "   ", email: "" })).toEqual({});
  });

  it("asks for details when the reason is Other", () => {
    expect(errorsOf({ reason: "other", details: "  ", email: "" })).toEqual({ details: "Tell us what's wrong" });
    expect(errorsOf({ reason: "other", details: "Audio cuts out at 12:00", email: "" })).toEqual({});
  });

  it("checks the email only when one is given", () => {
    expect(errorsOf({ reason: "rights_concern", details: "", email: "not-an-email" })).toEqual({ email: "Enter a valid email address" });
  });
});

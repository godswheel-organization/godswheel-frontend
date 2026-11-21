import { describe, expect, it } from "vitest";
import { toApiError } from "./apiError";

describe("toApiError", () => {
  it("reads code, message and correlation id from a service error", () => {
    expect(
      toApiError({
        status: 401,
        data: { error: "invalid_credentials", message: "Invalid profile code or NIN.", correlationId: "c1" },
      }),
    ).toMatchObject({ status: 401, code: "invalid_credentials", message: "Invalid profile code or NIN.", correlationId: "c1" });
  });

  it("keeps device_restricted details", () => {
    expect(
      toApiError({ status: 403, data: { error: "device_restricted", reason: "device_key_required", ref: "DR-1" } }),
    ).toMatchObject({ code: "device_restricted", reason: "device_key_required", ref: "DR-1" });
  });

  it("falls back to a status code when the body has no error code", () => {
    expect(toApiError({ status: 400, data: { message: "Request could not be processed." } }).code).toBe("bad_request");
  });

  it("reads the gateway's rate limit response", () => {
    expect(toApiError({ status: 429, data: { error: "try_later", retryAfterSec: 30 } })).toMatchObject({
      code: "try_later",
      retryAfterSec: 30,
    });
  });

  it("reads the GodsWheel API's nested error, with its per-field details", () => {
    expect(
      toApiError({
        status: 422,
        data: {
          success: false,
          error: {
            code: "validation_error",
            message: "The submitted account details are invalid.",
            details: { email: ["has invalid format"], acceptedTerms: ["must be accepted"], junk: 3 },
          },
        },
      }),
    ).toEqual({
      status: 422,
      code: "validation_error",
      message: "The submitted account details are invalid.",
      details: { email: ["has invalid format"], acceptedTerms: ["must be accepted"] },
      correlationId: undefined,
      ref: undefined,
      reason: undefined,
      retryAfterSec: undefined,
    });
    expect(toApiError({ status: 500, data: { success: false, error: { code: "internal_server_error", details: null } } })).toMatchObject({
      code: "internal_server_error",
      details: undefined,
    });
  });

  it("maps a network failure", () => {
    expect(toApiError({ status: "FETCH_ERROR", error: "Failed to fetch" }).code).toBe("network_error");
  });
});

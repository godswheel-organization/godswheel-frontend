import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// One shape for the error bodies in play: the GodsWheel API's { success: false, error: { code, message, details } },
// and flat ones (error + message, message only, error only) from gateways and the mock backend.
export interface ApiError {
  status: number | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";
  code: string;
  message?: string;
  correlationId?: string;
  ref?: string;
  reason?: string;
  retryAfterSec?: number;
  // Per-field validation messages, keyed by the API's field names (e.g. { email: ["has already been taken"] }).
  details?: Record<string, string[]>;
}

const FALLBACK_CODE_BY_STATUS: Record<number, string> = {
  400: "bad_request",
  401: "unauthenticated",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  428: "challenge_required",
  429: "try_later",
};

const textOrUndefined = (value: unknown) => (typeof value === "string" ? value : undefined);

// Keeps only { field: string[] } entries, whatever else the server puts there.
function readDetails(value: unknown): Record<string, string[]> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([field, messages]) => [field, (Array.isArray(messages) ? messages : [messages]).filter((m) => typeof m === "string")] as const)
    .filter(([, messages]) => messages.length > 0);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function toApiError(error: unknown): ApiError {
  const { status, data } = (error ?? {}) as Partial<FetchBaseQueryError> & { data?: unknown };
  const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

  if (typeof status !== "number") {
    return { status: status ?? "CUSTOM_ERROR", code: "network_error" };
  }

  // The GodsWheel API nests its error: { success: false, error: { code, message, details } }.
  const nested = body.error && typeof body.error === "object" ? (body.error as Record<string, unknown>) : undefined;

  return {
    status,
    code:
      textOrUndefined(nested?.code) ??
      textOrUndefined(body.error) ??
      FALLBACK_CODE_BY_STATUS[status] ??
      (status >= 500 ? "try_again" : "unknown_error"),
    message: textOrUndefined(nested?.message) ?? textOrUndefined(body.message),
    details: readDetails(nested?.details),
    correlationId: textOrUndefined(body.correlationId),
    ref: textOrUndefined(body.ref),
    reason: textOrUndefined(body.reason),
    retryAfterSec: typeof body.retryAfterSec === "number" ? body.retryAfterSec : undefined,
  };
}

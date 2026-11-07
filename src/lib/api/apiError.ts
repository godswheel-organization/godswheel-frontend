import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// One shape for the three error bodies in play: service (error + message), validation (message only), gateway (error only).
export interface ApiError {
  status: number | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";
  code: string;
  message?: string;
  correlationId?: string;
  ref?: string;
  reason?: string;
  retryAfterSec?: number;
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

export function toApiError(error: unknown): ApiError {
  const { status, data } = (error ?? {}) as Partial<FetchBaseQueryError> & { data?: unknown };
  const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

  if (typeof status !== "number") {
    return { status: status ?? "CUSTOM_ERROR", code: "network_error" };
  }

  return {
    status,
    code: textOrUndefined(body.error) ?? FALLBACK_CODE_BY_STATUS[status] ?? (status >= 500 ? "try_again" : "unknown_error"),
    message: textOrUndefined(body.message),
    correlationId: textOrUndefined(body.correlationId),
    ref: textOrUndefined(body.ref),
    reason: textOrUndefined(body.reason),
    retryAfterSec: typeof body.retryAfterSec === "number" ? body.retryAfterSec : undefined,
  };
}

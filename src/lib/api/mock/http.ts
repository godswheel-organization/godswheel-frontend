import type { MockRecords } from "./records";

export interface MockRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
  // Values of ":name" segments in the route's path.
  params: Record<string, string>;
}

export interface MockContext {
  db: MockRecords;
  // The signed-in user, or null for a guest.
  userId: string | null;
  now: () => Date;
}

export interface MockResponse {
  status: number;
  data?: unknown;
}

export interface MockRoute {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // e.g. "/library/sermons/:sermonId"
  path: string;
  // Answer 401 for guests before the handler runs.
  auth?: boolean;
  handle: (request: MockRequest, context: MockContext & { userId: string }) => Promise<MockResponse> | MockResponse;
}

export const ok = (data?: unknown, status = 200): MockResponse => ({ status, data });
export const noContent = (): MockResponse => ({ status: 204 });
// The same { error, message } body shape lib/api/apiError.ts reads from the real backend.
export const fail = (status: number, error: string, message?: string): MockResponse => ({
  status,
  data: { error, message },
});

// Request bodies are untrusted even in a mock: read fields defensively.
export function field(body: unknown, name: string): unknown {
  return body && typeof body === "object" ? (body as Record<string, unknown>)[name] : undefined;
}

export const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

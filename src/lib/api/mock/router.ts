import { accountRoutes } from "./handlers/account";
import { authRoutes } from "./handlers/auth";
import { bibleRoutes } from "./handlers/bible";
import { libraryRoutes } from "./handlers/library";
import { noteRoutes } from "./handlers/notes";
import { sermonRoutes } from "./handlers/sermons";
import { fail, type MockContext, type MockResponse, type MockRoute } from "./http";

// First match wins, so literal paths ("/sermons/search") come before parameterised ones ("/sermons/:sermonId").
const ROUTES: MockRoute[] = [...authRoutes, ...sermonRoutes, ...libraryRoutes, ...noteRoutes, ...accountRoutes, ...bibleRoutes];

const compiled = ROUTES.map((route) => ({
  route,
  names: [...route.path.matchAll(/:(\w+)/g)].map((match) => match[1]),
  pattern: new RegExp(`^${route.path.replace(/:\w+/g, "([^/]+)")}$`),
}));

export interface IncomingMockRequest {
  method: string;
  // Path relative to the API base, e.g. "/library/sermons/abc?x=1".
  url: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

export async function handleMockRequest(request: IncomingMockRequest, context: MockContext): Promise<MockResponse> {
  const url = new URL(request.url, "http://mock.local");
  const query = new URLSearchParams(url.search);
  for (const [key, value] of Object.entries(request.params ?? {})) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const method = request.method.toUpperCase();

  for (const { route, names, pattern } of compiled) {
    if (route.method !== method) continue;
    const match = url.pathname.match(pattern);
    if (!match) continue;
    if (route.auth && !context.userId) return fail(401, "unauthenticated");

    const params = Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
    return route.handle({ method, path: url.pathname, query, body: request.body, params }, { ...context, userId: context.userId! });
  }
  return fail(404, "not_found", `No mock route for ${method} ${url.pathname}`);
}

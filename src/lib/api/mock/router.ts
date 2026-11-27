import { accountRoutes } from "./handlers/account";
import { authRoutes } from "./handlers/auth";
import { bibleRoutes } from "./handlers/bible";
import { libraryRoutes } from "./handlers/library";
import { reportRoutes } from "./handlers/reports";
import { fail, type MockContext, type MockResponse, type MockRoute } from "./http";

// First match wins, so literal paths ("/library/sermons") come before parameterised ones ("/library/sermons/:sermonId").
// The sermon catalogue, bookmarks, notes and playback progress are the live API's, so they have no routes here.
const ROUTES: MockRoute[] = [...authRoutes, ...libraryRoutes, ...accountRoutes, ...bibleRoutes, ...reportRoutes];

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

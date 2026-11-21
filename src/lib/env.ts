import { z } from "zod";

const envSchema = z.object({
  // The GodsWheel API. Defaults to the deployed backend so a deploy without the variable still works.
  // TODO(backend): point at the production API domain once there is one.
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("https://godswheel.gigalixirapp.com/api/v1"),
  NEXT_PUBLIC_SESSION_COOKIE_NAME: z.string().min(1).default("session"),
  NEXT_PUBLIC_ENABLE_PWA: z
    .string()
    .default("false")
    .transform((rawValue) => rawValue === "true"),
  // While the backend is being integrated, endpoints not yet wired up are answered by an in-browser mock
  // (src/lib/api/mock, data in IndexedDB); the integrated ones (LIVE_ENDPOINTS in lib/api/baseQuery.ts) always
  // call NEXT_PUBLIC_API_BASE_URL. Set to "false" to send everything to the API. On unless explicitly "false".
  NEXT_PUBLIC_USE_MOCK_API: z
    .string()
    .default("true")
    .transform((rawValue) => rawValue !== "false"),
});

// An empty value (e.g. a blank variable in the hosting dashboard) counts as not set.
const read = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: read(process.env.NEXT_PUBLIC_API_BASE_URL),
  NEXT_PUBLIC_SESSION_COOKIE_NAME: read(process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME),
  NEXT_PUBLIC_ENABLE_PWA: read(process.env.NEXT_PUBLIC_ENABLE_PWA),
  NEXT_PUBLIC_USE_MOCK_API: read(process.env.NEXT_PUBLIC_USE_MOCK_API),
});

// Validated at boot — fails fast on a missing/malformed value, naming the variable rather than dumping Zod output.
if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${problems}. See .env.example.`);
}

export const env = parsed.data;

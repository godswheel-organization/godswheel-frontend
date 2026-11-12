import { z } from "zod";

const envSchema = z
  .object({
    // Required only once the real backend is in use (NEXT_PUBLIC_USE_MOCK_API=false). Until then nothing calls it,
    // so a deploy without it (e.g. a fresh Vercel project) still works.
    NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SESSION_COOKIE_NAME: z.string().min(1).default("session"),
    NEXT_PUBLIC_ENABLE_PWA: z
      .string()
      .default("false")
      .transform((rawValue) => rawValue === "true"),
    // Until the backend exists, API calls are answered by an in-browser mock (src/lib/api/mock) with data kept
    // in IndexedDB. Set to "false" to call NEXT_PUBLIC_API_BASE_URL instead. On unless explicitly "false".
    NEXT_PUBLIC_USE_MOCK_API: z
      .string()
      .default("true")
      .transform((rawValue) => rawValue !== "false"),
  })
  .superRefine((value, ctx) => {
    if (!value.NEXT_PUBLIC_USE_MOCK_API && !value.NEXT_PUBLIC_API_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_API_BASE_URL"],
        message: "is required when NEXT_PUBLIC_USE_MOCK_API is false",
      });
    }
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

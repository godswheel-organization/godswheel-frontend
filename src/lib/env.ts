import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SESSION_COOKIE_NAME: z.string().min(1),
  NEXT_PUBLIC_ENABLE_PWA: z
    .string()
    .default("false")
    .transform((rawValue) => rawValue === "true"),
});

// Validated at boot — fails fast on a missing/malformed value.
export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SESSION_COOKIE_NAME: process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME,
  NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
});

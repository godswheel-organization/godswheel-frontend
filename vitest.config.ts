import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // src/lib/env.ts validates these at import time — tests need real-looking
    // values since .env.local isn't loaded into process.env here.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:8081/v1",
      NEXT_PUBLIC_SESSION_COOKIE_NAME: "session",
      NEXT_PUBLIC_ENABLE_PWA: "false",
    },
  },
});

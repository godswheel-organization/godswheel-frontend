import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // Saved UI choices must not leak from one test into the next.
  // (Some suites run in a Node environment with no window.)
  if (typeof window !== "undefined") window.localStorage.clear();
});

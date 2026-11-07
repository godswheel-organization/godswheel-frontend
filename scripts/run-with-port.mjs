import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import path from "node:path";

const { loadEnvConfig } = nextEnv;

// next dev/start need a port before they've parsed any .env* file themselves
// (the HTTP server has to bind first), so PORT in .env.local is otherwise
// silently ignored. Load it ourselves and pass it through explicitly.
loadEnvConfig(process.cwd());

const [command, ...extraArgs] = process.argv.slice(2);
const port = process.env.PORT ?? "3000";
const nextBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next"
);

const child = spawn(nextBin, [command, "-p", port, ...extraArgs], {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

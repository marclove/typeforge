#!/usr/bin/env node
import { spawn } from "node:child_process";
import process from "node:process";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function prefixer(name, color) {
  const tag = `${color}${name}${colors.reset}`;
  return (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.length) process.stdout.write(`${colors.gray}[${tag}]${colors.reset} ${line}\n`);
    }
  };
}

function spawnProc(name, cmd, args, color) {
  const child = spawn(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    detached: process.platform !== "win32",
    env: process.env,
  });
  child.stdout.on("data", prefixer(name, color));
  child.stderr.on("data", prefixer(name, color));
  child.on("error", (err) => {
    console.error(`[dev] Failed to start ${name}:`, err.message);
    shutdown(1);
  });
  return child;
}

// Ports (can be overridden via env)
const SERVER_PORT = process.env.SERVER_PORT || "3000";
const CLIENT_PORT = process.env.CLIENT_PORT || "5173";

// Spawn dev:server (tsx watch) and dev:client (vite)
const server = spawn("tsx", ["watch", "src/index.ts"], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
  detached: process.platform !== "win32",
  env: { ...process.env, SERVER_PORT, PORT: SERVER_PORT },
});
server.stdout.on("data", prefixer("server", colors.green));
server.stderr.on("data", prefixer("server", colors.green));
server.on("error", (err) => {
  console.error("[dev] Failed to start server:", err.message);
  shutdown(1);
});

const client = spawn("vite", [], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
  detached: process.platform !== "win32",
  env: { ...process.env, CLIENT_PORT, VITE_SERVER_PORT: SERVER_PORT },
});
client.stdout.on("data", prefixer("client", colors.cyan));
client.stderr.on("data", prefixer("client", colors.cyan));
client.on("error", (err) => {
  console.error("[dev] Failed to start client:", err.message);
  shutdown(1);
});

let shuttingDown = false;

function killTree(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } else {
      // Kill process group
      process.kill(-child.pid, "SIGTERM");
    }
  } catch (e) {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  killTree(server);
  killTree(client);
  const timeout = setTimeout(() => process.exit(code), 1500);
  // Ensure we exit when both close
  let closed = 0;
  const tryExit = () => {
    closed += 1;
    if (closed >= 2) {
      clearTimeout(timeout);
      process.exit(code);
    }
  };
  server?.once("close", tryExit);
  client?.once("close", tryExit);
}

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));
process.on("exit", () => shutdown());

// If either exits unexpectedly, shut everything down with its code
server.on("exit", (code) => {
  if (!shuttingDown) shutdown(code ?? 1);
});
client.on("exit", (code) => {
  if (!shuttingDown) shutdown(code ?? 1);
});

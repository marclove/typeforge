#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Args from Git: <commit-msg-file> <source> <sha1>
const [, , msgFile, source = "", _sha = ""] = process.argv;

function safeRead(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function hasContent(msg) {
  // True if there is any non-comment, non-empty line
  return msg.split(/\r?\n/).some((l) => l.trim() && !l.trim().startsWith("#"));
}

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
  });
  return r.status === 0;
}

// Only run for supported scenarios
if (!msgFile || !existsSync(msgFile)) process.exit(0);

// Skip for merge/squash/revert messages to avoid overriding Git's own messages
const lowered = String(source).toLowerCase();
if (["merge", "squash", "commit", "message", "tag", "revert"].some((k) => lowered.includes(k))) {
  process.exit(0);
}

// If message already has content (e.g., -m provided), do nothing
const current = safeRead(msgFile);
if (hasContent(current)) process.exit(0);

// Try running llmc; if missing, try pnpm dlx llmc, then npx llmc
let ran = false;
function tryRun(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status === 0) ran = true;
  return r.status === 0;
}

if (which("llmc")) {
  tryRun("llmc", ["--no-commit"]);
} else if (which("pnpm")) {
  tryRun("pnpm", ["dlx", "llmc", "--no-commit"]);
} else if (which("npx")) {
  tryRun("npx", ["llmc", "--no-commit"]);
}

if (!ran) {
  // Could not run any llmc variant. Do not block commit.
  process.exit(0);
}

// Ensure a message exists; add a fallback if still empty to avoid editor opening
const after = safeRead(msgFile);
if (!hasContent(after)) {
  const placeholder = "chore: update\n\n# llmc did not produce a message; please edit.";
  try {
    writeFileSync(msgFile, placeholder, "utf8");
  } catch {}
}

process.exit(0);

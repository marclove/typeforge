#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const rel = (p) => path.relative(root, p);

const idxPath = path.join(root, "src", "index.ts");
const mainPath = path.join(root, "src", "main.ts");
const typesPath = path.join(root, "src", "shared", "types.ts");
const schemasPath = path.join(root, "src", "shared", "schemas.ts");

const errors = [];
const warnings = [];
const notes = [];

const args = new Set(process.argv.slice(2));
const wantPrompt = args.has("--prompt");
const wantDiff = args.has("--diff");
const autoYes = args.has("--yes");

function exist(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

// Check essential files
if (!exist(idxPath)) errors.push(`${rel(idxPath)} is missing. Expected server entry.`);
if (!exist(mainPath)) errors.push(`${rel(mainPath)} is missing. Expected client entry.`);

// Analyze content patterns (best-effort)
let idxContent = "";
let mainContent = "";
if (exist(idxPath)) {
  idxContent = fs.readFileSync(idxPath, "utf8");
  if (!/from\s+"@\/shared\/types"/.test(idxContent)) {
    warnings.push(
      `${rel(idxPath)} does not import from '@/shared/types'. Migration will skip import rewrite for this file.`,
    );
  }
}

if (exist(mainPath)) {
  mainContent = fs.readFileSync(mainPath, "utf8");
  if (
    !/from\s+"@\/shared\/types"/.test(mainContent) &&
    !/from\s+"@\/shared\/schemas"/.test(mainContent)
  ) {
    warnings.push(
      `${rel(mainPath)} has no shared types/schemas import. Migration will add schema usage only if pattern is found.`,
    );
  }
  if (
    !/as\s+HealthResponse/.test(mainContent) &&
    !/HealthResponseSchema\.parse\(/.test(mainContent)
  ) {
    warnings.push(
      `${rel(mainPath)} does not cast HealthResponse; schema.parse replacement may be skipped.`,
    );
  }
  if (
    !/as\s+HelloResponse/.test(mainContent) &&
    !/HelloResponseSchema\.parse\(/.test(mainContent)
  ) {
    warnings.push(
      `${rel(mainPath)} does not cast HelloResponse; schema.parse replacement may be skipped.`,
    );
  }
}

// Check schemas presence/shape
if (exist(schemasPath)) {
  const s = fs.readFileSync(schemasPath, "utf8");
  const hasHealth = /export\s+const\s+HealthResponseSchema\b/.test(s);
  const hasHello = /export\s+const\s+HelloResponseSchema\b/.test(s);
  if (!hasHealth || !hasHello) {
    errors.push(
      `${rel(schemasPath)} exists but missing expected exports (HealthResponseSchema, HelloResponseSchema).`,
    );
  } else {
    notes.push(`${rel(schemasPath)} present with expected exports.`);
  }
} else {
  notes.push(`${rel(schemasPath)} not found; 'just setup-zod' will scaffold it during migration.`);
}

// Warn that types.ts will be removed if present
if (exist(typesPath)) {
  warnings.push(`${rel(typesPath)} will be removed by the migration (kept in git history).`);
}

// Compute a summary of changes (dry-run) if requested
function simulateIndexRewrite(c) {
  return c.replace(
    /import\s+type\s+\{\s*HealthResponse\s*,\s*HelloResponse\s*\}\s+from\s+"@\/shared\/types";?/g,
    'import type { HealthResponse, HelloResponse } from "@/shared/schemas";',
  );
}

function simulateMainRewrite(c) {
  let out = c.replace(
    /import\s+type\s+\{\s*HealthResponse\s*,\s*HelloResponse\s*\}\s+from\s+"@\/shared\/types";?/g,
    'import { HealthResponseSchema, HelloResponseSchema } from "@/shared/schemas";',
  );
  out = out.replace(
    /\(await\s+res\.json\(\)\)\s+as\s+HealthResponse/g,
    "HealthResponseSchema.parse(await res.json())",
  );
  out = out.replace(
    /\(await\s+res\.json\(\)\)\s+as\s+HelloResponse/g,
    "HelloResponseSchema.parse(await res.json())",
  );
  return out;
}

const changes = [];
if (idxContent) {
  const newC = simulateIndexRewrite(idxContent);
  if (newC !== idxContent) changes.push({ file: rel(idxPath), kind: "modify" });
}
if (mainContent) {
  const newC = simulateMainRewrite(mainContent);
  if (newC !== mainContent) changes.push({ file: rel(mainPath), kind: "modify" });
}
if (exist(typesPath)) changes.push({ file: rel(typesPath), kind: "remove" });
if (!exist(schemasPath)) changes.push({ file: rel(schemasPath), kind: "add" });

// Print report
const hasErrors = errors.length > 0;
if (errors.length) {
  console.error("[preflight] Errors:");
  for (const e of errors) console.error(` - ${e}`);
}
if (warnings.length) {
  console.warn("[preflight] Warnings:");
  for (const w of warnings) console.warn(` - ${w}`);
}
if (notes.length) {
  console.log("[preflight] Notes:");
  for (const n of notes) console.log(` - ${n}`);
}

if (hasErrors) {
  console.error("[preflight] Aborting. Resolve the errors before running 'just switch-to-zod'.");
  process.exit(1);
} else {
  console.log(
    "[preflight] OK: switch-to-zod is expected to run without overwriting unknown files.",
  );
  if (wantDiff) {
    console.log("[preflight] Planned changes:");
    for (const c of changes) console.log(` - ${c.kind.toUpperCase()}: ${c.file}`);
  }
  if (autoYes) {
    // Non-interactive approval
    process.exit(0);
  }
  if (wantPrompt) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Proceed with switch-to-zod? [y/N] ", (answer) => {
      rl.close();
      const a = String(answer || "")
        .trim()
        .toLowerCase();
      if (a === "y" || a === "yes") {
        process.exit(0);
      } else {
        console.error("[preflight] Cancelled by user.");
        process.exit(2);
      }
    });
  }
}

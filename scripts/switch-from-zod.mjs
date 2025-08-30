#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filesToEdit = [path.join(root, "src", "index.ts"), path.join(root, "src", "main.ts")];

// Ensure TS-only types exist
const typesDir = path.join(root, "src", "shared");
const typesPath = path.join(typesDir, "types.ts");
if (!fs.existsSync(typesPath)) {
  fs.mkdirSync(typesDir, { recursive: true });
  fs.writeFileSync(
    typesPath,
    `export interface HealthResponse {\n  status: \"ok\" | \"degraded\" | \"error\";\n  service: string;\n  time: string; // ISO string\n}\n\nexport interface HelloResponse {\n  message: string;\n}\n`,
    "utf8",
  );
  console.log("[switch-from-zod] Created src/shared/types.ts");
}

function rewriteIndexTs(content) {
  // Replace schemas type import with types import
  const next = content.replace(
    /import\s+type\s+\{\s*HealthResponse\s*,\s*HelloResponse\s*\}\s+from\s+"@\/shared\/schemas";?/g,
    'import type { HealthResponse, HelloResponse } from "@/shared/types";',
  );
  return next;
}

function rewriteMainTs(content) {
  // Replace schema import with types import
  let out = content;
  const hasSchemasImport = /from\s+"@\/shared\/schemas";?/.test(out);
  if (hasSchemasImport) {
    // Remove the schemas import line entirely first
    out = out.replace(
      /import\s+\{\s*HealthResponseSchema\s*,\s*HelloResponseSchema\s*\}\s+from\s+"@\/shared\/schemas";?\n?/g,
      "",
    );
    // Add types import (dedupe if already present)
    if (!/from\s+"@\/shared\/types";?/.test(out)) {
      out = `import type { HealthResponse, HelloResponse } from "@/shared/types";\n${out}`;
    }
  }

  // Replace schema.parse with type assertions
  out = out.replace(
    /HealthResponseSchema\.parse\(await\s+res\.json\(\)\)/g,
    "(await res.json()) as HealthResponse",
  );
  out = out.replace(
    /HelloResponseSchema\.parse\(await\s+res\.json\(\)\)/g,
    "(await res.json()) as HelloResponse",
  );
  return out;
}

for (const file of filesToEdit) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  if (file.endsWith("index.ts")) content = rewriteIndexTs(content);
  if (file.endsWith("main.ts")) content = rewriteMainTs(content);
  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`[switch-from-zod] Updated ${path.relative(root, file)}`);
  }
}

// Remove schemas file if present
const schemasPath = path.join(root, "src", "shared", "schemas.ts");
if (fs.existsSync(schemasPath)) {
  fs.unlinkSync(schemasPath);
  console.log("[switch-from-zod] Removed src/shared/schemas.ts");
}

console.log(
  "[switch-from-zod] Complete. Consider running 'pnpm remove zod' if unused and 'pnpm format'.",
);

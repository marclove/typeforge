#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filesToEdit = [path.join(root, "src", "index.ts"), path.join(root, "src", "main.ts")];

const schemasPath = path.join(root, "src", "shared", "schemas.ts");
if (!fs.existsSync(schemasPath)) {
  console.error("[switch-to-zod] Missing src/shared/schemas.ts. Run 'just setup-zod' first.");
  process.exit(1);
}

function rewriteIndexTs(content) {
  // Replace import from types to schemas
  const next = content.replace(
    /import\s+type\s+\{\s*HealthResponse\s*,\s*HelloResponse\s*\}\s+from\s+"@\/shared\/types";?/g,
    'import type { HealthResponse, HelloResponse } from "@/shared/schemas";',
  );
  return next;
}

function rewriteMainTs(content) {
  // Replace import from types to schemas and types
  // import type { HealthResponse, HelloResponse } from "@/shared/types";
  let out = content;
  out = out.replace(
    /import\s+type\s+\{\s*HealthResponse\s*,\s*HelloResponse\s*\}\s+from\s+"@\/shared\/types";?/g,
    'import { HealthResponseSchema, HelloResponseSchema } from "@/shared/schemas";',
  );
  // Replace type assertions with schema.parse
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

for (const file of filesToEdit) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  if (file.endsWith("index.ts")) content = rewriteIndexTs(content);
  if (file.endsWith("main.ts")) content = rewriteMainTs(content);
  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`[switch-to-zod] Updated ${path.relative(root, file)}`);
  }
}

const typesPath = path.join(root, "src", "shared", "types.ts");
if (fs.existsSync(typesPath)) {
  fs.unlinkSync(typesPath);
  console.log("[switch-to-zod] Removed src/shared/types.ts");
}

console.log("[switch-to-zod] Complete. Consider running 'pnpm format' to format changes.");

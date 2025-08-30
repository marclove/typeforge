#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

function loadJSON(p) {
  return JSON.parse(read(p));
}

const errors = [];
const warnings = [];
const notes = [];

// Load repo configs
const pkg = loadJSON("package.json");
const proto = loadJSON("proto.json");
const just = read("justfile");

const readme = read("README.md");
const agents = fs.existsSync(path.join(root, "AGENTS.md")) ? read("AGENTS.md") : "";

// Collect script/recipe names
const pnpmScripts = new Set(Object.keys(pkg.scripts || {}));

const justRecipes = new Set();
const justAliases = new Map();
for (const line of just.split(/\r?\n/)) {
  const aliasMatch = line.match(/^alias\s+([A-Za-z0-9:_-]+)\s*:=\s*([A-Za-z0-9:_-]+)/);
  if (aliasMatch) {
    justAliases.set(aliasMatch[1], aliasMatch[2]);
    continue;
  }
  const recipeMatch = line.match(/^([A-Za-z0-9:_-]+):\s*$/);
  if (recipeMatch) justRecipes.add(recipeMatch[1]);
}
// Include aliases as valid commands
for (const [a] of justAliases) justRecipes.add(a);

// Extract backticked commands from docs
const docs = `${readme}\n${agents}`;
const codeTicks = [...docs.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

const pnpmCmds = codeTicks
  .map((c) => c.match(/^pnpm\s+([A-Za-z0-9:_-]+)/))
  .filter(Boolean)
  .map((m) => m[1]);

const justCmds = codeTicks
  .map((c) => c.match(/^just\s+([A-Za-z0-9:_-]+)/))
  .filter(Boolean)
  .map((m) => m[1]);

for (const s of pnpmCmds) {
  if (!pnpmScripts.has(s))
    errors.push(`README/AGENTS references pnpm script '${s}' which is not defined in package.json`);
}

for (const r of justCmds) {
  if (!justRecipes.has(r))
    errors.push(`README/AGENTS references just recipe '${r}' which is not defined in justfile`);
}

// Placeholder guard
if (/OWNER\/REPO/.test(readme)) {
  warnings.push(
    "README contains 'OWNER/REPO' placeholder. Replace with your GitHub slug after pushing.",
  );
}

// Path references (known core files)
const mustExist = [
  "src/index.ts",
  "src/main.ts",
  "index.html",
  "tsconfig.json",
  "biome.json",
  ".devcontainer/devcontainer.json",
  ".github/workflows/ci.yml",
];
for (const p of mustExist) {
  if (!fs.existsSync(path.join(root, p))) warnings.push(`Referenced path missing: ${p}`);
}

// Version consistency
const protoNode = String(proto.tools?.node || "");
const protoPnpm = String(proto.tools?.pnpm || "");

// Find Node and pnpm versions mentioned in README
let readmeNode = null;
let readmePnpm = null;
for (const line of readme.split(/\r?\n/)) {
  const nodeMatch = line.match(/Node\s+`([0-9]+(?:\.[0-9]+){0,2})`/i);
  if (nodeMatch) readmeNode = nodeMatch[1];
  const pnpmMatch = line.match(/pnpm:\s+`([0-9]+(?:\.[0-9]+){0,2})`/i);
  if (pnpmMatch) readmePnpm = pnpmMatch[1];
}

const toMajorMinor = (v) => v.split(".").slice(0, 2).join(".");
const toMajor = (v) => v.split(".")[0];

if (readmeNode) {
  // Require same major; warn if minor differs from proto pin
  if (toMajor(readmeNode) !== toMajor(protoNode)) {
    errors.push(
      `README Node version ${readmeNode} does not match proto major ${toMajor(protoNode)}`,
    );
  } else if (protoNode.includes(".") && toMajorMinor(readmeNode) !== toMajorMinor(protoNode)) {
    warnings.push(
      `README Node version ${readmeNode} differs from proto pin ${protoNode} (minor mismatch)`,
    );
  }
} else {
  notes.push("README does not explicitly mention a Node version in backticks.");
}

if (readmePnpm) {
  if (toMajorMinor(readmePnpm) !== toMajorMinor(protoPnpm)) {
    errors.push(
      `README pnpm version ${readmePnpm} does not match proto ${protoPnpm} (major.minor)`,
    );
  }
} else {
  notes.push("README does not explicitly mention a pnpm version in backticks.");
}

// Report
if (warnings.length) {
  console.warn("[docs:check] Warnings:");
  for (const w of warnings) console.warn(` - ${w}`);
}
if (errors.length) {
  console.error("[docs:check] Errors:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

if (notes.length) {
  console.log("[docs:check] Notes:");
  for (const n of notes) console.log(` - ${n}`);
}

console.log("[docs:check] OK: README/AGENTS look consistent.");

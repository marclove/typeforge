#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function die(msg) {
  console.error(`[bootstrap] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--slug") args.slug = argv[++i];
    else if (a === "--name") args.name = argv[++i];
    else if (a === "--description") args.description = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.slug || !args.name) {
  die(
    "Usage: bootstrap --slug <owner/repo> --name <package-name> [--description <text>] [--dry-run]",
  );
}

const root = process.cwd();
const changes = [];

function updateJSON(file, updater) {
  const p = path.join(root, file);
  const raw = fs.readFileSync(p, "utf8");
  const before = JSON.parse(raw);
  const after = updater({ ...before });
  const next = `${JSON.stringify(after, null, 2)}\n`;
  if (next !== raw) {
    changes.push({ file, kind: "modify" });
    if (!args.dryRun) fs.writeFileSync(p, next, "utf8");
  }
}

function updateText(file, fn) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return;
  const before = fs.readFileSync(p, "utf8");
  const after = fn(before);
  if (after !== before) {
    changes.push({ file, kind: "modify" });
    if (!args.dryRun) fs.writeFileSync(p, after, "utf8");
  }
}

// package.json name/description/repository
updateJSON("package.json", (pkg) => {
  pkg.name = args.name;
  if (args.description) pkg.description = args.description;
  pkg.repository = pkg.repository || {};
  if (typeof pkg.repository === "string") {
    pkg.repository = { type: "git", url: `https://github.com/${args.slug}.git` };
  } else {
    pkg.repository.type = pkg.repository.type || "git";
    pkg.repository.url = `https://github.com/${args.slug}.git`;
  }
  pkg.homepage = pkg.homepage || `https://github.com/${args.slug}`;
  return pkg;
});

// README badges OWNER/REPO replacement
updateText("README.md", (s) => s.replaceAll("OWNER/REPO", args.slug));

// Output plan
if (changes.length === 0) {
  console.log("[bootstrap] No changes needed.");
} else {
  console.log("[bootstrap] Planned changes:");
  for (const c of changes) console.log(` - ${c.kind.toUpperCase()}: ${c.file}`);
}

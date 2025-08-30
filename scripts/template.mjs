#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatesDir = path.join(root, "templates");

function die(msg) {
  console.error(`[template] ${msg}`);
  process.exit(1);
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function listTemplates() {
  if (!exists(templatesDir)) {
    console.log("[template] No templates directory found.");
    return;
  }
  function walk(dir, prefix = "") {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.name === ".DS_Store") continue;
      const rel = path.join(prefix, it.name);
      const full = path.join(dir, it.name);
      if (it.isDirectory()) {
        console.log(`${rel}/`);
        walk(full, rel);
      } else {
        console.log(rel);
      }
    }
  }
  walk(templatesDir);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// determine if file is text we should substitute
function isTextFile(p) {
  const exts = [
    ".ts",
    ".js",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".env",
    ".gitignore",
    ".txt",
    ".html",
    ".css",
  ];
  return exts.some((e) => p.endsWith(e));
}

function getSubstitutions(extraPairs = []) {
  const subs = {};
  // Environment variables: TPL_FOO -> __FOO__ / {{FOO}}
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith("TPL_")) {
      const key = k.slice(4);
      subs[`__${key}__`] = v;
      subs[`{{${key}}}`] = v;
    }
  }
  // CLI pairs key=value
  for (const pair of extraPairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx);
    const val = pair.slice(idx + 1);
    subs[`__${key}__`] = val;
    subs[`{{${key}}}`] = val;
  }
  return subs;
}

function applySubs(content, subs) {
  let out = content;
  for (const [k, v] of Object.entries(subs)) {
    out = out.split(k).join(v);
  }
  return out;
}

function copyFile(src, dest, force, subs) {
  const destDir =
    fs.existsSync(dest) && fs.lstatSync(dest).isDirectory() ? dest : path.dirname(dest);
  ensureDir(destDir);
  const finalDest =
    fs.existsSync(dest) && fs.lstatSync(dest).isDirectory()
      ? path.join(dest, path.basename(src))
      : dest;
  if (!force && exists(finalDest))
    die(
      `Refusing to overwrite existing file: ${path.relative(root, finalDest)} (use FORCE=1 to override)`,
    );
  if (isTextFile(src) && Object.keys(subs || {}).length > 0) {
    const content = fs.readFileSync(src, "utf8");
    const out = applySubs(content, subs);
    fs.writeFileSync(finalDest, out, "utf8");
  } else {
    fs.copyFileSync(src, finalDest);
  }
  console.log(`[template] Copied ${path.relative(root, src)} -> ${path.relative(root, finalDest)}`);
}

function copyDir(srcDir, destDir, force, subs) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, force, subs);
    } else {
      if (!force && exists(destPath))
        die(
          `Refusing to overwrite existing file: ${path.relative(root, destPath)} (use FORCE=1 to override)`,
        );
      ensureDir(path.dirname(destPath));
      if (isTextFile(srcPath) && Object.keys(subs || {}).length > 0) {
        const content = fs.readFileSync(srcPath, "utf8");
        const out = applySubs(content, subs);
        fs.writeFileSync(destPath, out, "utf8");
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(
        `[template] Copied ${path.relative(root, srcPath)} -> ${path.relative(root, destPath)}`,
      );
    }
  }
}

function applyTemplate(name, destArg, extraPairs) {
  if (!name) die("Usage: template apply <name> [dest]");
  const force = process.env.FORCE === "1" || process.argv.includes("--force");
  const subs = getSubstitutions(extraPairs);
  const srcPath = path.join(templatesDir, name);
  if (!exists(srcPath)) die(`Template not found: ${path.relative(root, srcPath)}`);
  const dest = destArg ? path.resolve(root, destArg) : root;
  const stat = fs.lstatSync(srcPath);
  if (stat.isDirectory()) {
    copyDir(srcPath, dest, force, subs);
  } else {
    copyFile(srcPath, dest, force, subs);
  }
}

const [, , cmd, a1, a2, ...rest] = process.argv;
switch (cmd) {
  case "list":
    listTemplates();
    break;
  case "apply":
    applyTemplate(a1, a2, rest);
    break;
  default:
    console.log("Usage: template <list|apply <name> [dest] [KEY=VALUE ...]>");
}

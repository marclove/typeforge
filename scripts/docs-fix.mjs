#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, env: process.env });
  return res.status === 0;
}

function ensureRemarkWrapped() {
  // Prefer pnpm dlx; fallback to npx; finally try a local install if present.
  const cmds = [
    ["pnpm", ["run", "-s", "docs:format"]],
    ["pnpm", ["dlx", "remark", ".", "-q", "-o", "--ext", "md", "--use", "remark-gfm"]],
    ["npx", ["-y", "remark-cli@^12", ".", "-q", "-o", "--ext", "md", "--use", "remark-gfm"]],
    ["remark", [".", "-q", "-o", "--ext", "md", "--use", "remark-gfm"]],
  ];
  for (const [c, a] of cmds) {
    try {
      if (run(c, a)) return true;
    } catch {}
  }
  console.error(
    "[docs:fix] Could not run remark to rewrap Markdown. Install remark-cli or allow pnpm/npx.",
  );
  return false;
}

function walk(dir, ignore = new Set(["node_modules", "dist", "build", "coverage", ".git"])) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, ignore));
    else out.push(p);
  }
  return out;
}

function wrapParagraph(text, width = 120) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if (line.length === 0) {
      line = w;
      continue;
    }
    if (line.length + 1 + w.length <= width) {
      line += ` ${w}`;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function localReflow(width = 120) {
  const files = walk(root).filter((p) => p.endsWith(".md"));
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const lines = src.split(/\r?\n/);
    const out = [];
    let i = 0;
    let inFence = false;
    let fenceChar = null;
    while (i < lines.length) {
      const line = lines[i];
      const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
      if (fenceMatch) {
        const marker = fenceMatch[2][0];
        if (!inFence) {
          inFence = true;
          fenceChar = marker;
        } else if (fenceChar === marker) {
          inFence = false;
          fenceChar = null;
        }
        out.push(line);
        i += 1;
        continue;
      }

      if (inFence) {
        out.push(line);
        i += 1;
        continue;
      }

      // Do not wrap: headings, list markers, blockquotes, tables, link reference definitions
      if (
        /^\s*$/.test(line) ||
        /^(\s*#|\s*[\-*+]\s+|\s*>|\s*\d+\.\s+|\s*\|)/.test(line) ||
        /^\s*\[[^\]]+\]:/.test(line)
      ) {
        out.push(line);
        i += 1;
        continue;
      }

      // Collect paragraph
      const buff = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(\s*#|\s*[\-*+]\s+|\s*>|\s*\d+\.\s+|\s*\|)/.test(lines[i]) &&
        !/^(\s*)(`{3,}|~{3,})/.test(lines[i]) &&
        !/^\s*\[[^\]]+\]:/.test(lines[i])
      ) {
        buff.push(lines[i]);
        i += 1;
      }
      const para = buff.join(" ");
      out.push(wrapParagraph(para, width));
      // Preserve blank line separation
      if (i < lines.length && /^\s*$/.test(lines[i])) {
        out.push("");
        i += 1;
      }
    }
    const next = out.join("\n");
    if (next !== src) {
      fs.writeFileSync(file, next, "utf8");
      console.log(`[docs:fix] Reflowed ${path.relative(root, file)}`);
    }
  }
}

function ensureFirstLineH1() {
  const readmePath = path.join(root, "README.md");
  if (!fs.existsSync(readmePath)) return;
  const raw = fs.readFileSync(readmePath, "utf8");
  const lines = raw.split(/\r?\n/);
  let firstIdx = 0;
  while (firstIdx < lines.length && lines[firstIdx].trim() === "") firstIdx += 1;
  const first = lines[firstIdx] || "";
  const isHeading = /^#\s+/.test(first);
  if (isHeading) return; // already OK

  // Derive title from package.json name, fallback to directory name.
  let title = path.basename(root);
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    if (pkg && typeof pkg.name === "string" && pkg.name.trim()) title = pkg.name.trim();
  } catch {}

  const header = `# ${title}`;
  const updated = [header, "", ...lines].join("\n");
  fs.writeFileSync(readmePath, updated, "utf8");
  console.log("[docs:fix] Inserted top-level heading in README.md for MD041");
}

// 1) Rewrap Markdown at 120 cols using remark (GFM aware), with local fallback
if (!ensureRemarkWrapped()) {
  localReflow(120);
}

// 2) Ensure README has an H1 as the first non-empty line
ensureFirstLineH1();

console.log("[docs:fix] Completed Markdown fixes.");

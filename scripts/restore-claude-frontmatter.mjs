#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseInlineMeta(s) {
  // Expect shape: name: ... description: ... permissions: allow: - "..." - "..." ...
  const out = { name: null, description: null, allow: [] };
  const nameIdx = s.indexOf("name:");
  const descIdx = s.indexOf("description:");
  const permIdx = s.indexOf("permissions:");
  const allowIdx = s.indexOf("allow:");
  if (nameIdx >= 0 && descIdx > nameIdx) {
    out.name = s.slice(nameIdx + 5, descIdx).trim();
  }
  if (descIdx >= 0) {
    const end = permIdx > descIdx ? permIdx : s.length;
    out.description = s.slice(descIdx + 12, end).trim();
  }
  const allowSrc = allowIdx >= 0 ? s.slice(allowIdx) : "";
  for (const m of allowSrc.matchAll(/-\s*"([^"]+)"/g)) {
    out.allow.push(m[1]);
  }
  return out;
}

function restore(file) {
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);

  // Detect empty/closed front matter at top: '---' then '---'
  if (lines[0]?.trim() === "---" && lines[1]?.trim() === "---") {
    // Find inline meta line(s) nearby
    let metaLineIdx = -1;
    for (let i = 2; i < Math.min(lines.length, 15); i++) {
      if (
        /^name:\s*/i.test(lines[i]) ||
        (lines[i].includes("name:") && lines[i].includes("description:"))
      ) {
        metaLineIdx = i;
        break;
      }
    }
    if (metaLineIdx !== -1) {
      const metaRaw = lines[metaLineIdx].replace(/\s+/g, " ");
      const meta = parseInlineMeta(metaRaw);
      const yaml = [
        "---",
        meta.name ? `name: ${meta.name}` : null,
        meta.description ? `description: ${meta.description}` : null,
        meta.allow.length ? "permissions:" : null,
        meta.allow.length ? "  allow:" : null,
        ...meta.allow.map((a) => `  - "${a}"`),
        "---",
        "",
      ]
        .filter(Boolean)
        .join("\n");

      // Remove the empty fm (first two '---' lines) and the inline meta line
      const body = [...lines.slice(2, metaLineIdx), ...lines.slice(metaLineIdx + 1)].join("\n");
      const next = `${yaml}${body}`;
      if (next !== raw) {
        fs.writeFileSync(file, next, "utf8");
        console.log(
          `[restore-claude-fm] Restored front matter in ${path.relative(process.cwd(), file)}`,
        );
      }
    }
  }
}

const globArg = process.argv[2] || ".claude";
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".md")) out.push(p);
  }
  return out;
}

const base = path.resolve(globArg);
const files = fs.existsSync(base) && fs.lstatSync(base).isDirectory() ? walk(base) : [base];
for (const f of files) restore(f);

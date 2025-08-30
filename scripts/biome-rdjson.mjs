#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    // Biome exits non-zero on findings; still capture stdout
    return e.stdout?.toString?.() || "";
  }
}

function collectBiomeJson() {
  const parts = [];
  for (const sub of [
    "pnpm exec biome lint . --reporter json",
    "pnpm exec biome format --check . --reporter json",
  ]) {
    const out = run(sub).trim();
    if (!out) continue;
    try {
      const parsed = JSON.parse(out);
      parts.push(parsed);
    } catch {
      // Ignore parse errors; best-effort
    }
  }
  return parts;
}

function toRdjson(parts) {
  const diags = [];
  for (const p of parts) {
    const files = Array.isArray(p?.files) ? p.files : [];
    for (const f of files) {
      const path = f?.path || f?.filePath || f?.filename;
      const messages = Array.isArray(f?.messages)
        ? f.messages
        : Array.isArray(f?.diagnostics)
          ? f.diagnostics
          : [];
      for (const m of messages) {
        const msg = m.message || m.description || m.content || "";
        const sev = String(m.severity || m.level || "warning").toLowerCase();
        const code = m.ruleId || m.rule || m.category || "biome";
        const loc = m.location || m.span || m.range || {};
        const start = loc.start ||
          loc.startPos ||
          loc.startPosition || { line: m.line || 1, column: m.column || 1 };
        const end = loc.end || loc.endPos || loc.endPosition || start;
        const startLine = Number(start.line || 1);
        const startCol = Number((start.column ?? start.col) || 1);
        const endLine = Number(end.line || startLine);
        const endCol = Number((end.column ?? end.col) || startCol);
        diags.push({
          message: msg,
          severity: sev === "error" ? "ERROR" : sev === "info" ? "INFO" : "WARNING",
          location: {
            path: String(path || ""),
            range: {
              start: { line: startLine, column: startCol },
              end: { line: endLine, column: endCol },
            },
          },
          code: { value: String(code) },
        });
      }
    }
  }
  return { source: { name: "biome" }, diagnostics: diags };
}

const parts = collectBiomeJson();
const rd = toRdjson(parts);
process.stdout.write(JSON.stringify(rd));

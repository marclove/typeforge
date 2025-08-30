import { execSync } from "node:child_process";
import fs from "node:fs";

function fail(msg) {
  console.error(`[toolchain] ${msg}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    fail(`Unable to read ${path}: ${e.message}`);
  }
}

const spec = readJson("./proto.json");
const expectedNode = String(spec?.tools?.node || "").trim();
const expectedPnpm = String(spec?.tools?.pnpm || "").trim();

if (!expectedNode) fail("Missing tools.node in proto.json");
if (!expectedPnpm) fail("Missing tools.pnpm in proto.json");

const actualNode = process.version.replace(/^v/, "");

function matchesNode(expected, actual) {
  // Relax enforcement to same major version even if proto pins exact.
  // - If expected is exact (e.g., 24.6.0), accept any 24.x.y
  // - If expected is a major (e.g., 24), accept any 24.x.y
  // - For other specs (~, ^), fall back to prefix logic
  const majorFrom = (v) => String(v).split(".")[0];
  if (/^\d+\.\d+\.\d+$/.test(expected)) {
    return majorFrom(expected) === majorFrom(actual);
  }
  if (/^\d+$/.test(expected)) {
    return majorFrom(expected) === majorFrom(actual);
  }
  // Fallback: compare numeric prefix
  return actual.startsWith(String(expected).replace(/[^0-9.].*$/, ""));
}

if (!matchesNode(expectedNode, actualNode)) {
  const expectedMajor = expectedNode.split(".")[0];
  fail(
    `Node ${actualNode} active; expected major ${expectedMajor} per proto pin (${expectedNode}). Run 'proto use' to activate.`,
  );
}

let pnpmVersion = "";
try {
  pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
} catch (e) {
  fail("pnpm not found. Ensure proto has installed tools: run 'proto install && proto use'.");
}

// Enforce pnpm major, and if proto specifies minor, enforce major.minor
const expParts = (expectedPnpm.match(/\d+/g) || []).map(Number);
const [expMaj, expMin] = expParts;
const [actMaj, actMin] = pnpmVersion.split(".").map((n) => Number(n));
if (Number.isFinite(expMaj) && actMaj !== expMaj) {
  fail(
    `pnpm ${pnpmVersion} active; expected major ${expMaj} per proto pin (${expectedPnpm}). Run 'proto install pnpm ${expectedPnpm} && proto use'.`,
  );
}
if (Number.isFinite(expMaj) && Number.isFinite(expMin) && actMin !== expMin) {
  fail(
    `pnpm ${pnpmVersion} active; expected ${expMaj}.${expMin}.x per proto pin (${expectedPnpm}). Run 'proto install pnpm ${expectedPnpm} && proto use'.`,
  );
}

console.log(`[toolchain] OK: node v${actualNode}, pnpm ${pnpmVersion}`);

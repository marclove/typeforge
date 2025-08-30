#!/usr/bin/env tsx

// Minimal CLI template.
// Apply: `just template cli . NAME=hello`
// Run:   `pnpm exec tsx src/scripts/__NAME__.ts -- --help`

function printHelp() {
  console.log("\nUsage: __NAME__ [options]\n\nOptions:\n  -h, --help   Show help\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    printHelp();
    return;
  }
  console.log("__NAME__: hello from CLI!", { args });
}

main().catch((err) => {
  console.error("__NAME__ error:", err);
  process.exit(1);
});

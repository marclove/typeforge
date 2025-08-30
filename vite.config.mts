import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

function gitignorePatterns(rootDir: string): string[] {
  const file = path.join(rootDir, ".gitignore");
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const patterns: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    // Normalize leading slash and trailing slash semantics
    let p = line.replace(/^\//, "");
    if (p.endsWith("/")) p = `${p}**`;
    // Make it match anywhere in the project
    if (!p.startsWith("**/")) p = `**/${p}`;
    patterns.push(p);
  }
  return patterns;
}

// Vite is configured for a framework-agnostic TypeScript app.
// Vitest configuration is co-located here under the `test` key.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  server: {
    hmr: true,
    port: Number(process.env.CLIENT_PORT || 5173),
    strictPort: false,
    open: process.env.VITE_OPEN !== "false",
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.VITE_SERVER_PORT || process.env.SERVER_PORT || 3000}`,
        changeOrigin: true,
        // Strip the /api prefix when forwarding to the server
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    watch: {
      // Ignore non-src folders to keep HMR focused and fast
      ignored: [
        "**/tests/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/README.md",
        "**/AGENTS.md",
        "**/CLAUDE.md",
        "**/.github/**",
        ...gitignorePatterns(process.cwd()),
      ],
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: process.env.CI
      ? ["dot", ["junit", { outputFile: "reports/junit.xml" }]]
      : ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});

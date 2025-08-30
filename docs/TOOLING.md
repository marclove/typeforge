# Tooling Overview

This repo is optimized for a smooth, reproducible DX. This guide summarizes what’s included and how to use it
day‑to‑day.

## Core Stack

- Node + pnpm (proto‑pinned): Node 24.x, pnpm 10.15.x.
- TypeScript + Vite + Vitest: Fast dev server, strict TS, tests with coverage and JUnit in CI.
- Biome: Formatter + linter + organize‑imports.
- Lefthook + commitlint + llmc: Git hooks, Conventional Commits, and optional AI commit message generation.
- GitHub Actions + Reviewdog: CI matrix (22.x, 24.6.0), PR annotations (Biome/actionlint/shellcheck), JUnit artifacts.

## Just Recipes (high‑value)

- Setup: `just init` (installs toolchain/deps, copies .env)
- Dev: `just start` (server+client), `pnpm dev:server`, `pnpm dev:client`
- Checks: `just ci`, `just test-ci`, `just typecheck`, `just lint`, `just format-check`
- Docs: `just docs-check`, `just lint-md`, `just docs-links`
- DX: `just dx-maintain`, `just deps-outdated`, `just deps-update-minor` (ask first)
- Worktrees: `just wt-new <name> [ref]`, `just wt-dx <name> [ref]`
- GitHub CLI: `just gh-status`, `just gh-login`, `just gh-pr-create`, `just gh-pr-comment`
- E2E: `just e2e` (Playwright; apply template and install) or `just e2e-dev` (spawns dev)
- Lighthouse: `just lhci` (requires dev server) or `just lhci-dev` (spawns dev)
- Verify: `just verify` (smoke test server /health and client /api/health)
- Doctor: `just doctor` (verify + fast unit tests)

## Git Hooks

- prepare-commit-msg: If available, runs `llmc --no-commit` (or `pnpm dlx llmc`/`npx llmc`) to draft a message. Never
  commits.
- pre-commit: Biome format check + lint on staged files.
- pre-push: Type-check + tests.
- commit-msg: commitlint enforces Conventional Commits.

## Dev Proxy & Ports

- Vite proxies `/api/*` → Node server (strips `/api`). Defaults: `SERVER_PORT=3000`, `CLIENT_PORT=5173`.
- Override via `.env` or environment variables.

## DX Automation

- Weekly maintenance workflow creates an issue report with: format/lint/docs/typecheck/tests/build/outdated/audit/knip.
- Reviewdog annotates PR diffs for Biome, actionlint, shellcheck.

## Releases

- Semantic‑release on main: analyzes Conventional Commits, updates CHANGELOG, publishes GitHub release.
- Preview: `just release-dry`.

## Templates

- List: `just templates-list`
- Apply: `just template <name> <dest> [KEY=VALUE ...]` (tokens: `__KEY__`, `{{KEY}}`; env `TPL_KEY` works too; set
  `FORCE=1` to overwrite).
- Built‑ins: `env` (dotenv loader), `zod` (schemas), `endpoint`, `cli`, `gh-issues`.

### Just recipe syntax notes

- Variadic args: recipes use the `+args` pattern (e.g., `template name dest +args`) so you can pass any number of
  `KEY=VALUE` pairs.
- Quoting: wrap values with spaces in quotes. Example: `APPLY=1 just bootstrap my-org/my-repo my-app "My amazing app"`.
- Overwrite: add `FORCE=1` to overwrite existing files when applying templates.

## Troubleshooting (quick)

- Toolchain mismatch: `just ensure` or `proto install && proto use`
- Hooks missing: `pnpm install` or `pnpm lefthook install` (inside a Git repo)
- Ports busy: adjust `.env` and rerun `pnpm dev`
- HMR: only watches `src/` by design (ignores tests/dist/build/coverage/.github and top‑level docs)

# typeforge

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/OWNER/REPO?display_name=tag\&color=blue)](https://github.com/OWNER/REPO/releases)

TypeScript Node starter with Vite (optional web entry), Vitest, Biome, pnpm, proto, Lefthook, semantic-release, and
GitHub Actions.

## Quick Start

- Prereq: install proto and ensure it’s on PATH.
- Bootstrap: `just init`
- Run dev (server + client): `just start` (alias: `just dev`)
- Try it:
  - App: the browser opens on the Vite URL
  - API: `http://localhost:3000/health` or via proxy `http://localhost:5173/api/health`
- Common follow‑ups: `just test`, `just lint`, `just ci`

## What You Get (Overview)

- Server + Client dev loop with graceful shutdown.
- Typed env loader, Vite proxy (`/api/*` → Node), shared types between client/server.
- Biome formatting/linting, Vitest with coverage and JUnit (in CI), markdownlint.
- Git hooks (Lefthook), Conventional Commits (commitlint), semantic‑release.
- CI: matrix builds, diff annotations (Biome/actionlint/shellcheck), frozen lockfile.

## Dev Proxy

- Vite proxies requests from `/api/*` to `http://localhost:${SERVER_PORT}` and strips the `/api` prefix.
- Example: `/api/health` → `http://localhost:3000/health` (uses `SERVER_PORT` or `VITE_SERVER_PORT`).

## API Endpoints (dev)

- GET `/api/health` → `{ status: "ok", service: "typeforge", time: "ISO" }`
- GET `/api/hello?name=YourName` → `{ message: "hello YourName" }`

## Prerequisites

- `proto` installed and on PATH (manages Node and pnpm)
- Git initialized in this directory if you want hooks enabled

## Toolchain

- Node: pinned via `proto.json` to `24.6.0` (also enforced in `package.json engines`).
- pnpm: `10.15` (pinned in `proto.json`); managed by proto.

## Setup

1. Install and activate toolchain (Node + pnpm)
   - `proto install && proto use`
1. Initialize project
   - `just init` (or run `pnpm install` manually)
   - Copies `.env.example` to `.env` if missing and installs Git hooks via Lefthook (through `prepare`)
1. (Optional) GitHub CLI
   - Install gh from <https://cli.github.com/>
   - Authenticate: `just gh-login` (or `gh auth login`)
   - Check status: `just gh-status`

## Scripts (pnpm)

- Dev (both): `pnpm dev` (runs server + client with graceful teardown)
- Dev (server only): `pnpm dev:server` (tsx watch)
- Dev (client only): `pnpm dev:client` (Vite with HMR, auto-opens browser)
- Test (CI reporter + coverage): `pnpm test:ci`
- Markdown lint: `pnpm lint:md`
- Release dry-run: `pnpm release:dry`
- Unused code audit: `pnpm audit:unused` (prod: `pnpm audit:unused:prod`)
- Dependency hygiene: `pnpm deps:dedupe`, `pnpm deps:audit`
- Type-check: `pnpm check`
- Build (Node / Web): `pnpm build` / `pnpm build:web`
- Preview (Web): `pnpm preview`
- Test (run/watch/coverage): `pnpm test` / `pnpm test:watch` / `pnpm coverage`
- Lint/Format (Biome): `pnpm lint` / `pnpm format` (check-only: `pnpm format:check`)

## Commands (just)

- Init toolchain + deps: `just init`
- Start dev (Vite) (alias: `just dev`): `just start`
- Ensure toolchain: `just ensure`
- Preview built Node app: `just preview`
- Preview built Vite app: `just preview-web`
- Lint: `just lint`
- Test (runs lint first): `just test`
- Clean (reinstall deps): `just clean`
- Type-check: `just typecheck`
- Build Node / Web: `just build` / `just build-web`
- Release (semantic-release): `just release`
- Local CI (format, lint, typecheck, test, build): `just ci`
- Install dotenv loader: `just setup-dotenv`
- Audit unused code: `just audit-unused` (prod: `just audit-unused-prod`)
- Dependency hygiene: `just deps-dedupe`, `just deps-audit`
- Diff lint (against base): `just lint-diff` (use env `BASE_REF`/`HEAD_SHA` in CI)
- PR annotations: `just lint-rd` (uses reviewdog; local: `just lint-rd-local`)
- Markdown lint: `just lint-md` (requires markdownlint-cli)
- GitHub Actions lint: `just lint-actions` (requires actionlint or Docker)
- Shell scripts lint: `just lint-shell` (requires shellcheck)
- Test for CI: `just test-ci`
- Release dry-run: `just release-dry`
- Docs consistency: `just docs-check`
- Link check: `just docs-links` (requires lychee or Docker)
- GitHub CLI: `just gh-status`, `just gh-login`, `just gh-pr-create`, `just gh-pr-comment`
- Worktrees: `just wt-new <name> [ref]`, `just wt-remove <name>`, `just wt-exec <name> <cmd>`, `just wt-dx <name> [ref]`
  (background DX maintenance)
- E2E tests (Playwright): `just e2e` (apply template and install first)
- E2E + dev server: `just e2e-dev` (spawns dev, runs Playwright, then stops)
- Lighthouse CI: `just lhci` (requires dev server running; apply template and install first)
- Lighthouse + dev server: `just lhci-dev` (spawns dev, runs LHCI, then stops)
- Verify dev health: `just verify` (checks server /health and client /api/health)
- Doctor: `just doctor` (verify + fast unit tests)

## Optional: Runtime Validation (Zod)

- Opt in with: `just setup-zod`
  - Installs `zod` and scaffolds `src/shared/schemas.ts` with `HealthResponseSchema` and `HelloResponseSchema`.
- Example client usage:
  - `const data = HelloResponseSchema.parse(await res.json())`
- Switch existing code to use Zod-inferred types and runtime parsing: `just switch-to-zod`
  - Runs an interactive preflight (with diff summary) first, then updates imports, replaces client-side JSON casts with
    schema.parse, removes `src/shared/types.ts`.
  - Non-interactive (e.g., CI/automation): `CONFIRM=1 just switch-to-zod` (preflight runs with `--yes`).
- Revert to TS-only types and remove Zod: `just switch-from-zod`
  - Restores `src/shared/types.ts`, switches imports back, replaces schema.parse with type assertions, removes
    `src/shared/schemas.ts`, and uninstalls `zod`.
- Preflight check (safe to switch?): `just preflight-switch-to-zod`
  - Ensures required files exist, validates existing `schemas.ts` exports (if present), reports what will be
    removed/changed, and aborts if risky.

## Git Hooks & Commits

- Hooks are managed by Lefthook (`lefthook.yml`). If hooks aren’t active: `pnpm lefthook install`.
- Pre-commit: Biome format check + lint on staged files
- Pre-push: Type-check + tests
- Commit messages are linted with commitlint (Conventional Commits), via the `commit-msg` hook.
- Commit message generation: the `prepare-commit-msg` hook uses `llmc --no-commit` to draft a Conventional Commit
  message. If `llmc` is not on PATH, it falls back to `pnpm dlx llmc --no-commit` or `npx llmc --no-commit`. It never
  performs the commit; it only prepares the message for review.

## Releases

- Semantic-release is configured in `.releaserc.json` and GitHub Actions (`release.yml`).
- Push conventional commits to `main`/`master` to generate a new release (GitHub release + CHANGELOG + version bump
  commit).

## CI

- Workflow: `.github/workflows/ci.yml`
  - Uses Node `24.6.0`, pnpm cache, frozen lockfile installs
  - PRs: runs fast diff-lint on changed files
  - PRs: publishes Biome, actionlint, and shellcheck annotations with Reviewdog
  - Runs Biome checks, type-check, tests (CI reporter + coverage), and builds (Node + Vite)
  - Dependabot: `.github/dependabot.yml` for npm and actions updates
  - Renovate: `renovate.json` manages npm/pnpm and groups minor/patch updates (automerge enabled for patch)

## Dev Container

- `.devcontainer/devcontainer.json` includes Node 24 + pnpm features and Biome defaults.
  - Open this folder in VS Code and “Reopen in Container”.
  - Personal Claude settings: create `.claude/settings.local.json` for your own preferences; it’s git-ignored and merged
    with project settings.

## Ports & Environment

- Defaults: `SERVER_PORT=3000`, `CLIENT_PORT=5173`
- Override in environment or `.env` before running `pnpm dev`
- The client receives `VITE_SERVER_PORT` for talking to the server if needed.

## Project Structure

- `src/index.ts` — Node entry
- `src/main.ts`, `index.html` — Vite browser entry (optional)
- `tests/` — Vitest tests
- `biome.json` — Biome formatter/linter config
- `tsconfig.json` — TypeScript config
- `.github/` — CI + release + dependabot
- `.devcontainer/` — Dev container config

See `AGENTS.md` for contributor guidelines.

## Further Reading

- Getting started guide: `docs/GETTING_STARTED.md`
- Tooling overview and workflows: `docs/TOOLING.md`
- Custom agents (Claude): `docs/CLAUDE_AGENTS.md`
- Project slash commands: `docs/SLASH_COMMANDS.md`
- Template engine and built‑ins: `docs/TEMPLATES.md`
- Release process: `docs/RELEASES.md`

Note: Replace `OWNER/REPO` in the badges with your GitHub slug after pushing.

## Troubleshooting

- Toolchain mismatch: run `just ensure` or `proto install && proto use` to activate pinned Node/pnpm.
- pnpm wrong version: `proto install pnpm 10.15.0 && proto use` (repo pins in `proto.json`).
- Hooks not installed: `pnpm install` or `pnpm lefthook install` (must be inside a Git repo).
- Ports in use: set `SERVER_PORT`/`CLIENT_PORT` in `.env` and restart `pnpm dev`.
- Vite not reloading: ensure you edit files in `src/`; Vite ignores `tests/`, `dist/`, `build/`, `coverage/`,
  `.github/`, and top‑level docs.
- Clean reinstall: `just clean` (removes `dist/`, `build/`, `coverage/`, `node_modules/` and reinstalls).
- Reviewdog annotations missing: ensure the run is on a PR and `GITHUB_TOKEN` is available (Actions provides it by
  default).
- Commitlint failures: follow Conventional Commits (e.g., `feat(api): add hello route`).

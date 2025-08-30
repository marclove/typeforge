# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Repository Guidelines

## Architecture Overview

This is a TypeScript Node.js starter with optional Vite web client:
- **Node server**: HTTP server (`src/index.ts`) with simple routing and graceful shutdown
- **Vite client**: Optional browser entry (`src/main.ts` + `index.html`) with API proxy
- **Shared types**: Common interfaces in `src/shared/types.ts` (or Zod schemas if enabled)
- **Environment**: Typed environment configuration in `src/env.ts` using dotenv
- **Template system**: Code generation via `scripts/template.mjs` with templates in `templates/`
- **Development loop**: Concurrent server + client with HMR via `scripts/dev.mjs`

Key endpoints:
- `GET /health` → `{ status: "ok", service: "typeforge", time: "ISO" }`
- `GET /hello?name=X` → `{ message: "hello X" }`
- Client accesses these via proxy: `/api/health`, `/api/hello`

## Project Structure & Module Organization

- Source in `src/`; tests in `tests/`; optional web entry `index.html` + `src/main.ts`.
- Keep configuration in repo: `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `.editorconfig`. Provide
  `.env.example`.
- Templates in `templates/` for code generation (CLI scripts, API endpoints, schemas, etc.)

## Build, Test, and Development Commands

- pnpm scripts (pnpm is provisioned via proto):
  - `pnpm dev`: Run server and client concurrently (tsx + Vite) with graceful shutdown.
  - `pnpm dev:server`: Node dev via tsx watch.
  - `pnpm dev:client`: Vite dev server (HMR, opens browser).
  - `pnpm build` / `pnpm build:web`: Build Node TS / Vite bundle.
  - `pnpm test` / `pnpm coverage`: Vitest run/coverage.
  - `pnpm lint` / `pnpm format`: Biome lint/format.

## Template System & Code Generation

- Templates located in `templates/` directory with `__NAME__` placeholders
- Generate code: `just template <name> <dest>` or `node scripts/template.mjs apply <name> <dest>`
- Available templates: `cli` (CLI scripts), `endpoint` (API routes), `env` (env config), `zod` (Zod schemas), `playwright` (E2E), `lhci` (Lighthouse)
- Templates are applied with variable substitution for rapid scaffolding

## Runtime Validation (Optional Zod Integration)

- **Default**: TypeScript-only types in `src/shared/types.ts`
- **Zod mode**: Runtime validation with schemas in `src/shared/schemas.ts`
- Switch to Zod: `just switch-to-zod` (interactive) or `CONFIRM=1 just switch-to-zod`
- Switch from Zod: `just switch-from-zod`
- Preflight check: `just preflight-switch-to-zod` (safe to switch analysis)
- When in Zod mode: client uses `schema.parse()` instead of type assertions

## Verification & E2E

- Quick health check: `just verify` starts/stops dev and checks server `/health` and client `/api/health`.
- E2E: `just e2e` (Playwright installed) or `just e2e-dev` (spawns dev automatically).
- Doctor: `just doctor` (verify + fast unit tests) for quick confidence.

## Coding Style & Naming Conventions

- Indentation: 2 spaces (JS/TS), 4 spaces (Python). Keep lines ≤ 100 chars.
- Naming: `camelCase` for TS, `PascalCase` for classes; kebab-case for files/dirs unless language dictates.
- Formatting/Linting (Node): Biome (`biome.json`) provides formatter, linter, and organize-imports. Use `pnpm format`
  and `pnpm lint`.

## Testing Guidelines

- Framework: Vitest. Place tests in `tests/` mirroring source paths.
- Names: `*.test.ts` (or `.js` if applicable).
- Coverage: Target ≥ 90% for core modules. Run `pnpm coverage`.
- Local run: `pnpm test` (CI runs on push/PR).

## Agent-Specific Tips

- Always confirm with the user before invoking disruptive tasks. Examples: `just switch-to-zod`, `just switch-from-zod`,
  `just clean`, `just release`.
- For migrations (Zod): prefer running `just preflight-switch-to-zod` first and share the summary with the user.
- Non-interactive mode is allowed only after explicit user approval. Set `CONFIRM=1` to bypass prompts.
  - Example (approved): `CONFIRM=1 just switch-to-zod`
- Use `just ensure` to verify toolchain before invoking build/test tasks.

## Commit & Pull Request Guidelines

- Commits: Use Conventional Commits. Example: `feat(api): add token refresh`
- PRs: Link issues, describe rationale + approach, include screenshots or logs when UI/CLI behavior changes, and note
  tests added/updated.
- Keep PRs focused and under \~300 lines of diff when possible.

## Security & Configuration

- Never commit secrets. Use `.env` locally and CI secrets for pipelines.
- `just init` copies `.env.example` to `.env` if missing.
- Validate inputs and handle errors explicitly; add security notes in `docs/SECURITY.md` when needed.

## Dev Proxy

- Vite proxies `/api/*` to the Node server on `SERVER_PORT` and strips the `/api` prefix for convenience.

## Ports & Environment

- Default ports: `SERVER_PORT=3000`, `CLIENT_PORT=5173` (configurable via environment or `.env`).

## Git Hooks

- Managed by Lefthook (`lefthook.yml`). Installed via `pnpm run prepare`.
- Toolchain enforcement: Hooks run `scripts/ensure-toolchain.mjs` to ensure Node and pnpm match `proto.json`.
- Pre-commit: Biome format check + lint on staged files. Pre-push: type-check + tests.

## Tooling Notes

- Package manager via proto-managed pnpm; Node version pinned with `proto.json` (24.6.0). Enforcement allows any Node
  within the same major (24.x).
- Always run `proto install && proto use` before development; Just recipes also verify the toolchain and will fail fast
  if the major version mismatches or pnpm version differs from proto.

## Automation & Scripts

Key scripts in `scripts/` directory:
- `dev.mjs`: Orchestrates concurrent server + client development with graceful shutdown
- `template.mjs`: Template engine for code generation with variable substitution
- `ensure-toolchain.mjs`: Validates proto toolchain matches requirements
- `switch-to-zod.mjs` / `switch-from-zod.mjs`: Automated migration between TS-only and Zod validation
- `bootstrap.mjs`: Project metadata replacement (replaces placeholder values)
- `generate-commit-msg.mjs`: Auto-generates conventional commit messages via llmc

Additional tooling:
- **DX maintenance**: `just dx-maintain` runs comprehensive health checks and hygiene tasks
- **Worktrees**: `just wt-new <name>`, `just wt-dx <name>` for parallel development branches
- **CI simulation**: `just ci` mirrors GitHub Actions locally
- **Auto-fix**: `just fix` applies all auto-fixable formatting and linting rules

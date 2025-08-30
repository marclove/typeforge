# Getting Started (Contributors)

This guide gets you productive fast and points you to deeper docs when needed.

## 1) Prerequisites

- Install proto and ensure it’s on PATH
- Optional: GitHub CLI (gh) for PR workflows

## 2) Bootstrap

- Activate toolchain: `proto install && proto use`
- Init project: `just init`
  - Copies `.env.example` to `.env`, installs deps, sets up hooks

## 3) Run the app

- Dev (server + client): `just start`
- Server only: `pnpm dev:server` | Client only: `pnpm dev:client`
- API: `/api/health`, `/api/hello?name=...`

## 4) Validate changes

- Quick checks: `just ci` (format, lint, types, tests, build)
- Only tests: `just test-ci`
- Lint/format: `just lint` + `just format-check`
- E2E tests: `just e2e` or `just e2e-dev` (apply Playwright template and install first)
- Lighthouse CI: `just lhci` or `just lhci-dev` (apply LHCI template; `*-dev` spawns server)
- Verify health: `just verify` (checks server and client proxy)
- Doctor: `just doctor` (verify + fast unit tests)

## 5) Committing

- Hooks run Biome + tests; commit messages must be Conventional Commits
- Optional AI message: `llmc` runs automatically in `prepare-commit-msg`

## 6) Open a PR

- With gh: `just gh-pr-create` (or `gh pr create --fill`)
- Annotated feedback appears via Reviewdog on PR diffs

## 7) DX helpers

- Maintenance: `just dx-maintain` (or use DX Navigator agent)
- Outdated deps: `just deps-outdated` | Dry-run release: `just release-dry`
- Worktrees for background tasks: `just wt-dx dx-[name]`

## 8) Templates (scaffolding)

- List: `just templates-list`
- Apply: `just template <name> <dest> NAME=Foo`

## 9) Read more

- Tooling: `docs/TOOLING.md`
- Agents: `docs/CLAUDE_AGENTS.md`
- Slash commands: `docs/SLASH_COMMANDS.md`
- Templates: `docs/TEMPLATES.md`

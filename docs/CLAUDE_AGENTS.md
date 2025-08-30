# Claude Agents

This repo ships specialized Claude Code agents to automate common tasks and keep DX superb.

## Agents

- DX Navigator: End‑to‑end maintenance. Runs checks, proposes improvements, and (with approval) updates deps or applies
  migrations.
- Toolchain: Ensures Node/pnpm match proto.json; activates the pinned toolchain.
- Biome: Formats/lints, and publishes annotations to PRs (via Reviewdog).
- Vitest: Runs tests locally/CI and enforces coverage.
- Vite: Manages client dev server, HMR, proxy.
- Hooks: Maintains Lefthook, commitlint, and llmc integration.
- Release: Guides semantic‑release dry‑run and real releases.
- CI: Explains GitHub Actions matrix and annotations.
- Docs: Keeps README/AGENTS consistent, lints Markdown, checks links.
- Deps: Dedupe/audit and Renovate strategy.
- Knip: Finds dead code/exports.
- Env: Dotenv loader and port config.
- Zod: Safe TS↔Zod migrations with preflight.

## Patterns

- Prefer Just recipes over raw commands.
- Ask before destructive changes (updates, cleanups, releases).
- Use worktrees for long‑running tasks: `just wt-dx name`.

See `.claude/agents/` for each agent’s details and permissions.

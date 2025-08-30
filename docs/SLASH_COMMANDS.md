# Custom Slash Commands

All project commands live in `.claude/commands/` and are available as `/command` inside Claude Code.

## Highlights

- `/dx-maintain`: Run full DX pass and summarize results.
- `/dx-report`: Produce a Markdown DX report and (optionally) comment on the PR.
- `/lint-diff [base] [head]`: Lint only changed files against a base.
- `/docs-check`: Docs consistency, markdownlint, and link checks.
- `/ensure-toolchain`: Activate proto‑pinned Node/pnpm.
- `/deps-outdated` and `/deps-update-minor` (ask): Inspect and update deps.
- `/release-dry-run`: Preview semantic‑release version/notes.
- `/release-pr [version]`: Draft a release PR from dry‑run notes (worktree‑aware).
- `/zod-preflight` and `/zod-switch` (ask): Safe TS ↔ Zod migrations.
- `/commit-message`: Draft a Conventional Commit message with llmc (no commit).
- `/pr-status`, `/pr-create`, `/pr-comment`: GitHub CLI helpers.

Each command’s file explains context used, any bash prelude (`!`), and expected output.

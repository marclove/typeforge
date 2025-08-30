---
allowed-tools: Bash(just dx-maintain), Bash(just deps-outdated), Bash(just deps-audit), Bash(just deps-dedupe), Bash(just audit-unused), Bash(just audit-unused-prod)
description: Perform a full DX maintenance pass and summarize results with actionable follow-ups
---

Run `just dx-maintain`, summarize findings (lint, docs, types, tests, builds, outdated deps, audit, knip), and propose next steps.

Worktree mode (recommended for long runs):

- Create a background worktree and run maintenance asynchronously: `just wt-dx dx-$DATE`.
- Tail `.worktrees/dx-$DATE/dx.log` for progress; present a summary when finished.

Ask for confirmation before any updating actions.

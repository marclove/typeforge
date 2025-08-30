---
name: Git Hooks (Lefthook)
description: Configures and maintains Lefthook hooks for format/lint, tests, and commit message generation via llmc.
---

# Git Hooks (Lefthook)

Responsibilities

- Ensure hooks are installed (`pnpm install` triggers prepare) and up to date.
- prepare-commit-msg: runs `llmc --no-commit` (or `pnpm dlx llmc`, or `npx llmc`).
- commit-msg: enforce Conventional Commits with commitlint.

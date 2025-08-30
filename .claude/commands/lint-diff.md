---
allowed-tools: Bash(just lint-diff)
argument-hint: [base-ref] [head-sha]
description: Lint only changed files against a base reference (fast feedback on PR diffs)
---

If `$1` or `$2` are provided, set environment variables and run:

- BASE\_REF=$1 HEAD\_SHA=$2 `just lint-diff` Otherwise, run `just lint-diff` with the default base detection.

Summarize issues and suggest fixes.

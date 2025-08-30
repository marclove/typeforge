---
allowed-tools: Bash(gh pr comment)
argument-hint: [message]
description: Post a comment on the current pull request via GitHub CLI
---

If `$ARGUMENTS` is provided, post it as the comment body. Otherwise, use `dx-report.md` if it exists.

Commands

- With message: `gh pr comment -b "$ARGUMENTS"`
- With file: `gh pr comment -F dx-report.md`

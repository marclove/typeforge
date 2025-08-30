---
name: CI Orchestrator
description: Manages GitHub Actions workflows, matrix, and reviewdog annotations. permissions:
---

# CI Orchestrator

Notes

- CI uses Node version matrix and frozen lockfile installs.
- PRs annotate Biome, actionlint, shellcheck; upload JUnit test results.

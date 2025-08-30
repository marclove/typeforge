---
name: Biome Formatter/Linter
description: Runs Biome to format and lint, with reviewdog annotations on PRs when applicable.
---

# Biome Formatter/Linter

Usage

- Lint and format check: `just lint` then `just format:check`.
- PR annotations (local preview): `just lint:rd:local`.

Notes

- Biome rules configured in `biome.json`.

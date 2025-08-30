---
allowed-tools: Bash(just format-check), Bash(just lint), Bash(just docs-check), Bash(just typecheck), Bash(just test-ci), Bash(just build), Bash(just build-web), Bash(pnpm outdated), Bash(pnpm audit), Bash(pnpm exec knip), Bash(gh pr view), Bash(gh pr comment), Bash(gh gist create), Edit, Write
description: Generate a DX report (format/lint/docs/types/tests/build/deps/audit/knip), summarize results, and optionally comment it on the current PR
---

Context (latest outputs)

- Format check: !`just format-check || true`
- Lint: !`just lint || true`
- Docs consistency: !`just docs-check || true`
- Type-check: !`just typecheck || true`
- Tests (CI): !`just test-ci || true`
- Build (Node): !`just build || true`
- Build (Vite): !`just build-web || true`
- Outdated deps: !`pnpm outdated || true`
- Security audit (prod): !`pnpm audit --prod || true`
- Knip (unused code): !`pnpm exec knip || true`

Your task

1. Produce a concise Markdown DX Report summarizing pass/fail for each section above with the most relevant lines. Keep
   it readable and under \~200 lines.
1. If `gh` is available and a PR is detected (`gh pr view --json number` succeeds), ask permission to post the report as
   a comment. If approved:
   - Write the report to `dx-report.md` and run `gh pr comment -F dx-report.md`.
1. Otherwise, present the report inline and suggest copying it into the PR.

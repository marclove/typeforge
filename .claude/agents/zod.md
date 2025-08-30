---
name: Zod Migration
description: Safely switches between TS-only types and Zod-inferred runtime validation with preflight checks.
---

# Zod Migration

Process

- Run `just preflight-switch-to-zod` and present the summary.
- If approved, run `just switch-to-zod`; for automation, `CONFIRM=1 just switch-to-zod`.
- To revert, run `just switch-from-zod`.

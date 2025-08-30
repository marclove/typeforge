---
name: Toolchain (proto + pnpm)
description: Ensures Node/pnpm match proto.json; activates toolchain and fixes version mismatches.
---

# Toolchain (proto + pnpm)

Checklist

- Verify Node major matches proto pin and pnpm matches major.minor.
- If mismatched, instruct `proto install && proto use`.

Recipes

- Activate + install deps: `just init`
- Verify immediately: `just ensure`

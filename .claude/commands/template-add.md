---
---

# Template Add

allowed-tools: Write, Edit, Bash(mkdir), Bash(git add), Bash(git status), Bash(just templates-list)
argument-hint: [template-name]
description: Add a new project template under templates/ and document how to apply it with substitutions

Instructions

1. Create a new directory at `templates/$1/` (or a single file `templates/$1`). Organize files as they should appear
   under the target destination when applied.
1. Use token placeholders where customization is desired:
   - `__NAME__` or `{{NAME}}` (double-curly) will be replaced during application.
1. Applying the template:
   - List available templates: `just templates-list`
   - Apply into a destination folder: `just template $1 <dest> KEY1=VALUE1 KEY2=VALUE2`
     - You can also set environment variables `TPL_NAME=...` to substitute `__NAME__` and `{{NAME}}`.
   - To overwrite existing files, set `FORCE=1`.

Provide a concise summary of the template’s purpose and usage in a short README snippet alongside the files if needed.

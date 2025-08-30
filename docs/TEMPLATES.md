# Templates

Project templates live in `templates/` and are applied with Just recipes.

## Listing & Applying

- List: `just templates-list`
- Apply: `just template <name> <dest> [KEY=VALUE ...]`
  - Tokens: `__KEY__` and `{{KEY}}` substituted from CLI pairs or `TPL_KEY` env vars.
  - Refuses to overwrite unless `FORCE=1` or `--force`.

## Built-in Templates

- `env/` → `src/env.ts`: Dotenv loader and safe port parsing.
- `zod/` → `src/shared/schemas.ts`: Zod schemas for shared API types.
- `endpoint/` → `src/api/__NAME__.ts`: Minimal server endpoint.
- `cli/` → `src/scripts/__NAME__.ts`: Minimal tsx CLI script.
- `gh-issues/` → `.github/ISSUE_TEMPLATE/*`: GitHub issue templates.

## Authoring New Templates

- Create a folder under `templates/<name>/` matching the desired structure at destination.
- Use token placeholders (e.g., `__NAME__`) where customization is needed.
- Document usage with a comment or snippet in the template files.
- Try it: `just template <name> <dest> NAME=Example`

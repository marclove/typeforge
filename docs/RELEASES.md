# Release Process

This repository uses semantic‑release to automate versioning, changelog generation, and GitHub Releases. No manual
version bumps are committed.

## Commit conventions → versions

- fix: … → patch bump (x.y.Z)
- feat: … → minor bump (x.Y.0)
- BREAKING CHANGE: … (footer) or bang (!) in type/scope → major bump (X.0.0)
- Other types (chore, docs, test, refactor, perf, build, ci, style) do not trigger a release by themselves.

See commitlint + Conventional Commits in Hooks.

## Dry run and preview

- Preview next version and notes locally: `just release-dry`
- Checks recent commits since the last tag; prints the planned version and generated changelog section.

## What happens on release

1. Merge to default branch (main/master) with conventional commits
1. CI runs; Release workflow (release.yml) invokes semantic‑release
1. semantic‑release:
   - Determines next version from commit history
   - Updates/creates CHANGELOG.md
   - Creates a GitHub Release with notes
   - Commits CHANGELOG.md and package.json version bump back to the repo (skip‑ci)

The GitHub Actions token (`GITHUB_TOKEN`) is used automatically for permissions.

## Creating a Release PR (optional)

- Use `/release-pr [version]` to scaffold a draft PR:
  - Runs a dry run, writes RELEASE\_DRAFT.md
  - Creates a release/vX.Y.Z branch (worktree‑aware)
  - Opens a draft PR via `gh pr create --draft`
- Merge when ready; semantic‑release publishes on main/master.

## Rollback and hotfixes

- If a bad release occurs, revert the offending commits and push to main; semantic‑release will publish a corrective
  release as needed.
- For urgent fixes, create a bugfix branch (`/bugfix`) and follow the standard flow.

## Tips

- Run `just ci` before opening PRs
- Keep PRs focused; ensure commit messages reflect user‑visible changes
- Use `just dx-maintain` periodically to keep the repo healthy

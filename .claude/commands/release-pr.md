---

allowed-tools: Bash(just release-dry), Bash(git add), Bash(git commit), Bash(git push), Bash(git switch), Bash(git checkout), Bash(gh pr create), Edit, Write
argument-hint: [version]
description: Create a draft Release PR using semantic-release notes. Generates RELEASE\_DRAFT.md, commits it on a release branch, and opens a draft PR
---

# Release Pr

Plan (worktree-aware)

1. Run `just release:dry` to determine the next version and capture changelog notes.
1. Derive version `$1` (if provided) or parse it from the dry-run output.
1. Create a dedicated worktree `.worktrees/release-v$1` from the current base.
1. Write a concise `RELEASE_DRAFT.md` including:
   - Proposed version (e.g., v$1)
   - Changelog excerpt
   - Checklist (CI green, approvals, post-merge release plan)
1. In the worktree, create a branch `release/v$1`, commit `RELEASE_DRAFT.md`, push, and open a draft PR to the default
   base.

Commands (best effort)

- Dry-run: `just release-dry`
- Worktree: `just wt-new release-v$1` (defaults to HEAD)
- Create/checkout branch (within worktree): `git switch -c release/v$1` (fallback: `git checkout -b release/v$1`)
- Stage + commit: `git add RELEASE_DRAFT.md && git commit -m "chore(release): draft v$1"`
- Push: `git push -u origin HEAD`
- Draft PR: `gh pr create --draft --title "chore(release): v$1 (draft)" --body-file RELEASE_DRAFT.md`

Notes

- This does not publish a release; it prepares a PR for review.
- Update the draft file/PR body as needed before merging.
- The actual release happens from main/master via semantic-release after merge.

---
allowed-tools: Bash(git status), Bash(git branch), Bash(git switch), Bash(git checkout), Bash(git push), Bash(just lint-diff), Bash(just test-ci), Bash(gh pr create)
argument-hint: [issue-or-pr-number] [short-title]
description: Create a bugfix branch, run focused checks, and (optionally) open a PR
---

Context

- Current branch: !`git branch --show-current`
- Working tree: !`git status --porcelain=v1`

Task (worktree-aware)

1. Create a new worktree `.worktrees/bugfix-$1` from the current branch: `just wt-new bugfix-$1`. Then create a branch
   named `bugfix/$1-<slug($2 or 'fix')>` inside the worktree using `git switch -c` (fallback: `git checkout -b`).
1. Instruct the user to stage changes incrementally. After staging some changes:
   - Run `just lint-diff` against the diff from the base to HEAD (fast feedback)
   - Run `just test-ci` for CI-like coverage
1. Repeat until the fix is ready. Encourage small, focused commits (use llmc if desired) and confirm commitlint
   compliance.
1. With user approval, push the branch and open a PR via `gh pr create --fill` (from worktree).

Notes

- Use Conventional Commits for messages (e.g., `fix: <scope> …`).
- If the bug relates to an issue/PR, include `Fixes #$1` in the PR description.

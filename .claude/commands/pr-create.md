---
allowed-tools: Bash(git push), Bash(gh pr create)
description: Create a pull request for the current branch using GitHub CLI
---

Task

- Ensure the current branch is pushed: !`git push -u origin HEAD` (ignore errors if already pushed)
- Create a PR: run `gh pr create --fill` (falls back to interactive mode if metadata is missing).

Output

- Provide the created PR URL and a short summary of the title/description.

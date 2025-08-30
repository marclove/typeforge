set shell := ["zsh", "-eu", "-o", "pipefail", "-c"]

alias dev := start

# Autofix all autofixable issues (formatters/linters)
fix:
    just ensure
    # 1) Biome: format + apply fixable lint rules
    pnpm format
    pnpm run lint:fix
    # 2) Markdown: reflow and ensure first-line H1, then lint with markdownlint (strict)
    node scripts/docs-fix.mjs
    pnpm exec markdownlint --fix '**/*.md' --config ./.markdownlint.jsonc --ignore node_modules --ignore dist --ignore coverage --ignore build
    # 3) Shell scripts: format with shfmt if available
    if command -v shfmt >/dev/null 2>&1; then \
      shfmt -w -s .; \
    else \
      echo "[fix] shfmt not found, skipping shell formatting"; \
    fi
    echo "[fix] Autofixes applied. Review changes and re-run checks as needed."

# Ensure correct toolchain is active (proto + corepack)
ensure:
    node scripts/ensure-toolchain.mjs

# Initialize toolchain and dependencies (proto-managed)
init:
    # Ensure toolchain via proto, which installs Node and pnpm as pinned in proto.json
    proto install
    proto use
    # Create a fresh .env from example if missing
    if [ -f .env.example ] && [ ! -f .env ]; then cp .env.example .env; fi
    pnpm install

# Start dev (server + client)
start:
    just ensure
    pnpm dev

# Run tests (Vitest)
test:
    just ensure
    pnpm lint
    pnpm test

# Build Node app and run built output
preview:
    just ensure
    pnpm build
    pnpm start

# Build Vite app and preview static build
preview-web:
    just ensure
    pnpm build:web
    pnpm preview

# Remove build artifacts and node_modules, then reinstall
clean:
    just ensure
    rm -rf dist build coverage node_modules
    pnpm install

# Lint only
lint:
    just ensure
    pnpm lint

format-check:
    just ensure
    pnpm format:check

# Type-check TypeScript
typecheck:
    just ensure
    pnpm check

# Build Node app
build:
    just ensure
    pnpm build

# Build Vite web app
build-web:
    just ensure
    pnpm build:web

# Create a release (semantic-release)
release:
    just ensure
    pnpm release

# Run local CI checks (mirror GitHub Actions)
ci:
    just ensure
    just format-check
    just lint
    just typecheck
    pnpm test:ci
    just build
    just build-web

# Lint only changed files against a base
lint-diff:
    just ensure
    BASE=${BASE_REF-${BASE-$(git merge-base HEAD origin/${GITHUB_BASE_REF-main} 2>/dev/null || git merge-base HEAD main 2>/dev/null || echo '')}}; \
    HEAD=${HEAD_SHA-${HEAD-HEAD}}; \
    if [ -n "$BASE" ]; then RANGE="$BASE...$HEAD"; else RANGE="$HEAD"; fi; \
    files=$(git diff --name-only $RANGE | grep -E '\\.(ts|tsx|js|jsx|json|cjs|mjs|cts|mts)$' || true); \
    if [ -n "$files" ]; then pnpm exec biome lint $files && pnpm exec biome format --check $files; else echo "[lint:diff] No changed files"; fi

test-ci:
  just ensure
  pnpm test:ci

release-dry:
  just ensure
  pnpm release:dry

# E2E tests (Playwright)
e2e:
  just ensure
  if command -v pnpm >/dev/null 2>&1; then \
    if pnpm exec -- playwright --version >/dev/null 2>&1; then \
      pnpm exec playwright test; \
    else \
      echo "[e2e] Playwright not installed. Apply template: 'just template playwright .' then install: 'pnpm add -D @playwright/test' and 'pnpm exec playwright install'" >&2; exit 1; \
    fi; \
  else \
    echo "[e2e] pnpm not found." >&2; exit 1; \
  fi

# Lighthouse CI (requires dev server running)
lhci:
  just ensure
  if command -v pnpm >/dev/null 2>&1; then \
    if pnpm exec -- lhci --help >/dev/null 2>&1; then \
      pnpm exec lhci autorun --config=./.lighthouserc.json; \
    else \
      echo "[lhci] LHCI not installed. Apply template: 'just template lhci .' then install: 'pnpm add -D @lhci/cli'" >&2; exit 1; \
    fi; \
  else \
    echo "[lhci] pnpm not found." >&2; exit 1; \
  fi

# Run Playwright tests with a temporary dev server
e2e-dev:
  just ensure
  if ! pnpm exec -- playwright --version >/dev/null 2>&1; then \
    echo "[e2e-dev] Playwright not installed. Apply template: 'just template playwright .' then install: 'pnpm add -D @playwright/test' and 'pnpm exec playwright install'" >&2; exit 1; \
  fi
  LOG=.e2e-dev.log; PID=.e2e-dev.pid; \
  VITE_OPEN=false nohup pnpm dev > "$LOG" 2>&1 & echo $! > "$PID"; \
  CLIENT_PORT=${CLIENT_PORT-5173}; WAIT_TIMEOUT=${WAIT_TIMEOUT-60}; \
  echo "[e2e-dev] Waiting for dev server on :$CLIENT_PORT (timeout ${WAIT_TIMEOUT}s)..."; \
  ok=0; for i in $(seq 1 $WAIT_TIMEOUT); do \
    (curl -sSf "http://localhost:$CLIENT_PORT" >/dev/null 2>&1 || nc -z localhost $CLIENT_PORT >/dev/null 2>&1) && ok=1 && break; \
    sleep 1; \
  done; \
  if [ $ok -ne 1 ]; then echo "[e2e-dev] Dev server did not become ready" >&2; if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi; exit 1; fi; \
  pnpm exec playwright test; \
  if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi

# Run Lighthouse CI with a temporary dev server
lhci-dev:
  just ensure
  if ! pnpm exec -- lhci --help >/dev/null 2>&1; then \
    echo "[lhci-dev] LHCI not installed. Apply template: 'just template lhci .' then install: 'pnpm add -D @lhci/cli'" >&2; exit 1; \
  fi
  LOG=.lhci-dev.log; PID=.lhci-dev.pid; \
  VITE_OPEN=false nohup pnpm dev > "$LOG" 2>&1 & echo $! > "$PID"; \
  CLIENT_PORT=${CLIENT_PORT-5173}; WAIT_TIMEOUT=${WAIT_TIMEOUT-60}; \
  echo "[lhci-dev] Waiting for dev server on :$CLIENT_PORT (timeout ${WAIT_TIMEOUT}s)..."; \
  ok=0; for i in $(seq 1 $WAIT_TIMEOUT); do \
    (curl -sSf "http://localhost:$CLIENT_PORT" >/dev/null 2>&1 || nc -z localhost $CLIENT_PORT >/dev/null 2>&1) && ok=1 && break; \
    sleep 1; \
  done; \
  if [ $ok -ne 1 ]; then echo "[lhci-dev] Dev server did not become ready" >&2; if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi; exit 1; fi; \
  pnpm exec lhci autorun --config=./.lighthouserc.json; \
  if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi

# Verify dev environment health (server + proxy)
verify:
  just ensure
  LOG=.verify.log; PID=.verify.pid; \
  SERVER_PORT=${SERVER_PORT-3000}; CLIENT_PORT=${CLIENT_PORT-5173}; WAIT_TIMEOUT=${WAIT_TIMEOUT-60}; \
  echo "[verify] Starting dev (SERVER_PORT=$SERVER_PORT, CLIENT_PORT=$CLIENT_PORT)..."; \
  SERVER_PORT=$SERVER_PORT CLIENT_PORT=$CLIENT_PORT VITE_OPEN=false nohup pnpm dev > "$LOG" 2>&1 & echo $! > "$PID"; \
  echo "[verify] Waiting for client on :$CLIENT_PORT (timeout ${WAIT_TIMEOUT}s)..."; \
  ok=0; for i in $(seq 1 $WAIT_TIMEOUT); do \
    (curl -sSf "http://localhost:$CLIENT_PORT" >/dev/null 2>&1 || nc -z localhost $CLIENT_PORT >/dev/null 2>&1) && ok=1 && break; \
    sleep 1; \
  done; \
  if [ $ok -ne 1 ]; then echo "[verify] Client not ready" >&2; if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi; exit 1; fi; \
  echo "[verify] Checking server /health..."; \
  curl -sSf "http://localhost:$SERVER_PORT/health" | grep -q '"status"\s*:\s*"ok"' || { echo "[verify] Server /health failed" >&2; if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi; exit 1; }; \
  echo "[verify] Checking client proxy /api/health..."; \
  curl -sSf "http://localhost:$CLIENT_PORT/api/health" | grep -q '"status"\s*:\s*"ok"' || { echo "[verify] Client /api/health failed" >&2; if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi; exit 1; }; \
  echo "[verify] OK"; \
  if [ -f "$PID" ]; then kill $(cat "$PID") >/dev/null 2>&1 || true; rm -f "$PID"; fi

# Doctor: ultra-fast health + unit tests
doctor:
  just verify
  pnpm exec vitest run --reporter=dot

# Reviewdog: annotate Biome findings on PRs
lint-rd:
    just ensure
    node scripts/biome-rdjson.mjs | reviewdog -f=rdjson -name="biome" -filter-mode=diff_context -reporter=${REPORTER-github-pr-check} -fail-on-error=true

lint-rd-local:
    just ensure
    node scripts/biome-rdjson.mjs | reviewdog -f=rdjson -name="biome" -filter-mode=diff_context -reporter=local -fail-on-error=false

# Actionlint (local): requires actionlint installed or Docker
lint-actions:
    just ensure
    if command -v actionlint >/dev/null 2>&1; then \
      actionlint -color never; \
    elif command -v docker >/dev/null 2>&1; then \
      docker run --rm -v "$PWD:/work" -w /work rhysd/actionlint:latest -color never; \
    else \
      echo "[lint:actions] actionlint not found. Install from https://github.com/rhysd/actionlint or install Docker." >&2; exit 1; \
    fi

# Shellcheck (local): requires shellcheck installed
lint-shell:
    just ensure
    if command -v shellcheck >/dev/null 2>&1; then \
      files=$(git ls-files '*.sh' || true); \
      if [ -n "$files" ]; then shellcheck $files; else echo "[lint:shell] No shell scripts found"; fi; \
    else \
      echo "[lint:shell] shellcheck not found. Install from https://www.shellcheck.net/" >&2; exit 1; \
    fi

# Install dotenv and scaffold env loader (idempotent)
setup-dotenv:
  just ensure
  pnpm add dotenv
  mkdir -p src
  node scripts/template.mjs apply env src

# Dependency hygiene
deps-dedupe:
    just ensure
    pnpm dedupe

deps-audit:
    just ensure
    pnpm audit --prod

# Unused code / exports audit
audit-unused:
    just ensure
    pnpm exec knip

audit-unused-prod:
    just ensure
    pnpm exec knip --production

# Markdown lint (local)
lint-md:
    just ensure
    pnpm exec markdownlint '**/*.md' --ignore node_modules --ignore dist --ignore coverage --ignore build

# Docs consistency checks
docs-check:
    just ensure
    node scripts/check-docs.mjs

# Docs link checks via lychee (requires Docker or lychee installed)
docs-links:
    just ensure
    if command -v lychee >/dev/null 2>&1; then \
      lychee --no-progress --timeout 20 --max-concurrency 10 README.md AGENTS.md; \
    elif command -v docker >/dev/null 2>&1; then \
      docker run --rm -v "$PWD:/work" -w /work lycheeverse/lychee:latest --no-progress --timeout 20 --max-concurrency 10 README.md AGENTS.md; \
    else \
      echo "[docs:links] lychee not found. Install from https://github.com/lycheeverse/lychee or install Docker." >&2; exit 1; \
    fi

# GitHub CLI helpers
gh-status:
    if command -v gh >/dev/null 2>&1; then \
      gh auth status || true; \
    else \
      echo "[gh:status] GitHub CLI (gh) not found. Install from https://cli.github.com/" >&2; exit 1; \
    fi

gh-login:
    if command -v gh >/dev/null 2>&1; then \
      gh auth login; \
    else \
      echo "[gh:login] GitHub CLI (gh) not found. Install from https://cli.github.com/" >&2; exit 1; \
    fi

gh-pr-create:
    if command -v gh >/dev/null 2>&1; then \
      gh pr create --fill || gh pr create; \
    else \
      echo "[gh:pr:create] GitHub CLI (gh) not found. Install from https://cli.github.com/" >&2; exit 1; \
    fi

gh-pr-comment:
    if command -v gh >/dev/null 2>&1; then \
      FILE="${FILE-dx-report.md}"; \
      if [ -f "$FILE" ]; then gh pr comment -F "$FILE"; else echo "[gh:pr:comment] File not found: $FILE" >&2; exit 1; fi; \
    else \
      echo "[gh:pr:comment] GitHub CLI (gh) not found. Install from https://cli.github.com/" >&2; exit 1; \
    fi

# Show outdated dependencies
deps-outdated:
    just ensure
    pnpm outdated || true

# DX maintenance: run common checks and hygiene tasks
dx-maintain:
    just ensure
    just format-check
    just lint
    just docs-check
    # Link check may require lychee or Docker; do not fail maintenance if missing
    (just docs-links) || echo "[dx-maintain] Skipping link check (lychee not available)"
    just typecheck
    pnpm test:ci
    just build
    just build-web
    pnpm outdated || true
    pnpm dedupe || true
    pnpm audit --prod || true
    pnpm exec knip || true
    echo "[dx:maintain] Completed. Review output above for actions."

# Optional bulk minor/patch updates (interactive/local use recommended)
deps-update-minor:
    just ensure
    pnpm update -r

# Optional: add Zod for runtime validation and scaffold schemas
setup-zod:
  just ensure
  pnpm add zod
  node scripts/template.mjs apply zod src

# Switch codebase to Zod-inferred types and runtime parsing
switch-to-zod:
    just ensure
    if [ -z "${CONFIRM-}" ]; then \
      node scripts/preflight-switch-to-zod.mjs --diff --prompt; \
    else \
      node scripts/preflight-switch-to-zod.mjs --diff --yes; \
    fi
    just setup-zod
    node scripts/switch-to-zod.mjs
    pnpm format

# Revert to TS-only types from Zod
switch-from-zod:
    just ensure
    node scripts/switch-from-zod.mjs
    pnpm remove zod || true
    pnpm format

# Preflight: check switch-to-zod will not overwrite unexpected files
preflight-switch-to-zod:
    just ensure
    node scripts/preflight-switch-to-zod.mjs

# Git worktree helpers
wt-new name ref="HEAD":
    mkdir -p .worktrees
    git worktree add --force --checkout .worktrees/{{ name }} {{ ref }}

wt-remove name:
    git worktree remove -f .worktrees/{{ name }} || true
    git worktree prune

wt-exec name cmd:
    zsh -lc "cd .worktrees/{{ name }} && {{ cmd }}"

# Run DX maintenance in a separate worktree (background)
wt-dx name ref="HEAD":
    just wt-new {{ name }} {{ ref }}
    nohup zsh -lc "cd .worktrees/{{ name }} && just ensure && just dx-maintain" > .worktrees/{{ name }}/dx.log 2>&1 & disown
    echo "[wt-dx] Started DX maintenance in .worktrees/{{ name }} (log: .worktrees/{{ name }}/dx.log)"
# Templates
templates-list:
  node scripts/template.mjs list

template name dest +args:
  node scripts/template.mjs apply {{name}} {{dest}} {{args}}

# Markdown-only autofix (reflow + lint --fix)
fix-md:
    just ensure
    node scripts/fix-frontmatter.mjs **/*.md
    node scripts/md-normalize.mjs **/*.md
    node scripts/docs-fix.mjs
    node scripts/markdown-reflow.mjs
    pnpm exec markdownlint --fix '**/*.md' --config ./.markdownlint.jsonc --ignore node_modules --ignore dist --ignore coverage --ignore build

# Bootstrap project metadata (dry-run by default)
bootstrap slug name desc:
  DRY=1; if [ -n "${APPLY-}" ]; then DRY=0; fi; \
  if [ "$DRY" = "1" ]; then \
    node scripts/bootstrap.mjs --dry-run --slug {{slug}} --name {{name}} --description "{{desc}}"; \
    echo "[bootstrap] Dry run. Set APPLY=1 to write changes."; \
  else \
    node scripts/bootstrap.mjs --slug {{slug}} --name {{name}} --description "{{desc}}"; \
  fi

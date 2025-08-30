# Docs Site (GitHub Pages)

This repo ships a minimal, zero-build docs site that publishes the `docs/` folder to GitHub Pages via Actions.

## What’s already set up

- Workflow: `.github/workflows/pages.yml` deploys `docs/` to Pages on pushes to `main`/`master` (or manually via “Run
  workflow”).
- No Jekyll: `docs/.nojekyll` ensures files are served as-is.
- Index: `docs/README.md` acts as the landing page; it links to all detailed docs.

## One-time setup (maintainers)

1. Push these changes to your default branch.
1. In GitHub → Settings → Pages:
   - Set “Build and deployment” to “GitHub Actions”.
   - Save. The next push will deploy. You can also dispatch the workflow.
1. After a successful run, your site URL will appear on the Environment named `github-pages`.

## Local authoring workflow

- Add or edit Markdown files in `docs/` (e.g., `docs/TOOLING.md`).
- Link them from `docs/README.md`.
- Commit and push; the Pages workflow will publish automatically on the next run.

## Customization tips

- Landing page: You can add a simple `docs/index.html` with links and a style if you want a prettier home page (Markdown
  will still be served).
- Directory structure: Organize subfolders under `docs/` and link to them from `docs/README.md`.
- Custom domain: In Pages settings, set your domain, then add a `CNAME` file in `docs/` containing the domain. The
  workflow will publish it.
- Access control: For private repos in paid plans, configure Pages visibility in Settings as needed.

## Troubleshooting

- Workflow doesn’t deploy: Ensure Settings → Pages is set to “GitHub Actions” and that the workflow ran on
  `main`/`master`.
- 404 or stale content: Give Pages a minute to update; hard refresh the browser. Verify the artifact path (`docs/`) in
  `pages.yml` matches your folder.
- Broken links: Run `just docs-links` locally or rely on CI’s link check in PRs.

---
name: Vite Dev Server
description: Manages client dev server with HMR, proxy, and watch filters.
---

# Vite Dev Server

Usage

- Run client (with server concurrently): `just start`
- Preview built client: `just preview-web`
- Quick health check: `just verify` (starts/stops dev, checks /health and /api/health)

Notes

- Proxy `/api/*` to Node server; update in `vite.config.ts`.
- Watches `src/`, ignores tests/, dist/, build/, coverage/, docs, .github.

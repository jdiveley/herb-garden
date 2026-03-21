# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite (port 5173) + Express (port 3001) concurrently
npm run server    # Start Express backend only
npm run build     # Build React app to dist/
npm run preview   # Preview production build
```

No lint or test tooling is configured.

## Architecture

Full-stack herb garden website: React 18 frontend (Vite) + Express REST API backend. Data is persisted to `server/data.json` — no database.

**Routing** (React Router v6):
- `/` → `PublicSite.jsx` — public-facing garden site
- `/admin/login` → `AdminLogin.jsx`
- `/admin` → `AdminDashboard.jsx` (protected by `RequireAuth.jsx`)

**API** (`server/index.js`, port 3001):
- Public: `GET /api/data`, `POST /api/login`, `POST /api/contact`
- Protected (JWT): `PUT /api/hero`, `PUT /api/about`, `PUT /api/stats`, and CRUD on `/api/herbs`

Vite proxies `/api/*` to `http://localhost:3001` in dev.

**Auth**: Single admin password from `ADMIN_PASSWORD` env var, verified with bcryptjs, returns a JWT signed with `JWT_SECRET`.

**Data model** in `server/data.json`:
```json
{
  "hero": { "eyebrow", "title", "titleEmphasis", "description" },
  "about": { "paragraph1", "paragraph2", "paragraph3", "signature" },
  "stats": [{ "id", "value", "label" }],
  "herbs": [{ "id", "name", "emoji", "status", "quantity", "description", "tip", "season" }]
}
```

**Email**: Contact form submissions are sent via Nodemailer using Gmail credentials from env vars (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_EMAIL`).

## Styling

CSS variables are defined in `src/index.css` and used across all component `.css` files. Key tokens: `--cream`, `--bark`, `--moss`, `--sage`, `--fern`, `--leaf` for the earthy garden palette. Fonts: `Cormorant Garamond` (display), `EB Garamond` (body), `Raleway` (accent).

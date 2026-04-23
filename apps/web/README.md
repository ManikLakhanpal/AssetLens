# Web App (`apps/web`)

Next.js frontend for **authenticated** portfolio visualization and AI chat.

## Responsibilities

- **Auth:** `/login`, `/signup`, JWT stored in `localStorage` (`assetlens_token`), Axios request interceptor attaches `Authorization: Bearer`.
- **Settings (`/settings`):** View profile; save Binance and/or Zerodha API keys via `PUT /auth/credentials`.
- **Zerodha Kite redirect (`/trade/redirect`):** Reads `request_token` from the query string, calls `POST /zerodha/generate-token`, shows success when the API stores the daily session token.
- Render portfolio dashboard cards and charts with **GSAP** staggered enter animations (portfolio pie uses a single `GET /portfolio/data` request).
- Display Binance + Zerodha account data for the **logged-in** user only.
- **AuthGuard** wraps the main dashboard so unauthenticated visitors are redirected to `/login`.
- Bottom-right AI chat widget with full-screen mode, native **Markdown** rendering, and model toggle (`chatgpt` / `gemini`).
- LangChain-backed tools can trigger Binance/Zerodha actions through the same authenticated API.

## Environment variables

Copy [`.env.example`](.env.example):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | AssetLens API base URL (default `http://localhost:4000`) |

## Local development

```bash
cd apps/web
npm install
npm run dev
```

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint checks

## Type checking

```bash
cd apps/web
npx tsc --noEmit
```

## Related docs

- [`apps/web/AGENTS.md`](AGENTS.md) — Next.js agent notes
- Root and API docs: [`../../README.md`](../../README.md), [`../api/README.md`](../api/README.md)

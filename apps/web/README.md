# Web App (`apps/web`)

Next.js frontend for portfolio visualization and AI chat.

## Responsibilities

- Render portfolio dashboard cards and charts.
- Display Binance + Zerodha account data.
- Provide bottom-right AI chat widget with model toggle (`chatgpt` / `gemini`).

## Required Environment Variable

Use [`apps/web/.env.example`](.env.example):

- `NEXT_PUBLIC_API_URL` (usually `http://localhost:4000`)

## Local Development

```bash
cd apps/web
npm install
npm run dev
```

## Scripts

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint checks

## Type Checking

```bash
cd apps/web
npx tsc --noEmit
```

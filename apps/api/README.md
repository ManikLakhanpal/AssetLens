# API Service (`apps/api`)

Express + TypeScript backend for portfolio aggregation, broker integrations, and AI proxy routes.

## Responsibilities

- Serve Binance and Zerodha data endpoints.
- Aggregate portfolio summary and asset-level valuation.
- Proxy LLM requests to `apps/langchain-service` via `/ai/*`.

## Key Route Groups

- **Portfolio**
  - `GET /portfolio/summary`
  - `GET /portfolio/assets`
  - `GET /portfolio/binance/inr-value`
- **Binance**
  - `GET /binance/funding-account-data`
  - `GET /binance/spot-account-data`
  - `GET /binance/permissions`
  - `POST /binance/convert`
  - `POST /binance/transfer`
- **Zerodha**
  - `GET /zerodha/profile`
  - `GET /zerodha/stock-holdings-data`
  - `GET /zerodha/mf-holdings-data`
  - `GET /zerodha/mf-sips`
  - `POST /zerodha/generate-token`
- **AI proxy**
  - `POST /ai/chat`

## Environment Variables

Use [`apps/api/.env.example`](.env.example) as a template.

Required/important keys:

- `PORT` (default `4000`)
- `FASTAPI_BASE_URL` (default `http://localhost:8000`)
- `BINANCE_API_KEY`
- `BINANCE_API_SECRET`
- `ZERODHA_API_KEY`
- `ZERODHA_API_SECRET`
- `ZERODHA_ACCESS_TOKEN`

## Local Development

```bash
cd apps/api
npm install
npm run dev
```

## Type Checking

```bash
cd apps/api
npm run typecheck
```


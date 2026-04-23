# ⚙️ API Service (`apps/api`)

Express + TypeScript backend for **authenticated** portfolio aggregation, Binance and Zerodha broker integrations, and AI proxy routes.

## 🧩 Responsibilities

- 🔐 **Auth:** Register, login, JWT verification, encrypted storage of Binance/Zerodha API keys (PostgreSQL + AES-256-GCM).
- 🔒 **Data isolation:** All broker and portfolio data is loaded for `req.userId` from the JWT — credentials and Redis caches are keyed per user (`binance:credentials:{userId}`, `binance:inr:{userId}`, `zerodha:access_token:{userId}`, `portfolio:summary:{userId}`, etc.).
- 💰 Serve Binance and Zerodha endpoints using credentials from the database.
- 📊 Aggregate portfolio summary and asset-level valuation (with Redis TTL caching when upstream data succeeds).
- 🤖 Proxy LLM requests to `apps/langchain-service` via `/ai/*`.

## 🛡️ Public vs Protected Routes

| Mount | Auth |
|-------|------|
| `POST /auth/register`, `POST /auth/login` | Public |
| `GET /health` | Public |
| `/binance/*`, `/zerodha/*`, `/portfolio/*`, `/ai/*` | **JWT required** — `Authorization: Bearer <token>` |

Implementation: [`src/server.ts`](src/server.ts) mounts `/auth` first, then applies `authMiddleware` globally for all other routes.

## 📡 Key Route Groups

### 🔐 Auth (public)

- `POST /auth/register` — body: `{ username, password }`
- `POST /auth/login` — body: `{ username, password }` → `{ token }`

### 🔐 Auth (JWT)

- `GET /auth/me`
- `PUT /auth/credentials` — body: optional `binance` / `zerodha` `{ apiKey, apiSecret }` (each section upserted independently)

### 📊 Portfolio

- `GET /portfolio/data` — `{ summary, assets, mfHoldings }` for dashboard pie chart and LangChain tools (summary/assets may be `null` on individual service errors)
- `GET /portfolio/binance/inr-value`

### 💰 Binance

- `GET /binance/funding-account-data`
- `GET /binance/spot-account-data`
- `GET /binance/permissions`
- `POST /binance/convert`
- `POST /binance/transfer`

### 🇮🇳 Zerodha

- `GET /zerodha/login-url` — JSON `{ login_url }` for Kite OAuth
- `GET /zerodha/profile`
- `GET /zerodha/stock-holdings-data`
- `GET /zerodha/mf-holdings-data`
- `GET /zerodha/mf-sips`
- `POST /zerodha/generate-token` — body: `{ request_token }` (persists encrypted access token + Redis for that user)
- `POST /zerodha/place-order` — validated order payload

### 🤖 AI Proxy

- `POST /ai/portfolio-summary`
- `POST /ai/chat`

## 🗃️ Database and ORM

- **Prisma 7** with PostgreSQL — schema in [`prisma/schema.prisma`](prisma/schema.prisma) (`User`, `BinanceCredentials`, `ZerodhaCredentials`).
- Run migrations: `npx prisma migrate dev`
- Generate client (if needed): `npx prisma generate`

## 🔑 Environment Variables

Copy [`.env.example`](.env.example) to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Signing key for access tokens |
| `ENCRYPTION_KEY` | 64 hex chars (32 bytes) for AES-256-GCM on stored secrets |
| `FASTAPI_BASE_URL` | LangChain service (default `http://localhost:8000`) |
| `ZERODHA_ACCESS_TOKEN` | Optional fallback before a DB-stored daily token exists |

Broker API keys are **not** required in `.env` for normal operation; users save them via `PUT /auth/credentials` (web Settings).

## 🚀 Local Development

```bash
cd apps/api
npm install
npm run dev
```

## ✅ Type Checking

```bash
cd apps/api
npm run typecheck
```

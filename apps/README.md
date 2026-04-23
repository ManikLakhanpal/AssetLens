# 📂 Apps Directory

This monorepo is organized into three application services:

- ⚙️ [`api/`](api) — Node.js/Express backend: **JWT auth**, PostgreSQL (Prisma), Redis caching, per-user Binance and Zerodha integrations, portfolio aggregation, and AI proxy endpoints.
- 🌐 [`web/`](web) — Next.js frontend: login/signup, settings for API keys, dashboard, and AI chat widget.
- 🤖 [`langchain-service/`](langchain-service) — Python FastAPI + LangChain service for portfolio summarization and chat completion.

## 📖 Service Documentation

- API docs: [`apps/api/README.md`](api/README.md)
- Web docs: [`apps/web/README.md`](web/README.md)
- LangChain service docs: [`apps/langchain-service/README.md`](langchain-service/README.md)

## 🚀 Local Start Order

1. 🐘 **PostgreSQL** and 🔴 **Redis** running (see `DATABASE_URL` / `REDIS_URL` in `apps/api/.env.example`).
2. 🗃️ Run Prisma migrations: `cd apps/api && npx prisma migrate dev`
3. 🐍 Start **langchain-service** (port `8000`)
4. ⚙️ Start **api** (port `4000`)
5. 🌐 Start **web** (port `3000`)

## 🔑 Environment Templates

- [`apps/api/.env.example`](api/.env.example)
- [`apps/web/.env.example`](web/.env.example)
- [`apps/langchain-service/.env.example`](langchain-service/.env.example)

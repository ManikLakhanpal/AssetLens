# Apps Directory

This monorepo is organized into three application services:

- [`api/`](api) - Node.js/Express backend for broker integrations, portfolio aggregation, and AI proxy endpoints.
- [`web/`](web) - Next.js frontend dashboard and AI chat widget.
- [`langchain-service/`](langchain-service) - Python FastAPI + LangChain service for portfolio summarization and chat completion.

## Service Documentation

- API docs: [`apps/api/README.md`](api/README.md)
- Web docs: [`apps/web/README.md`](web/README.md)
- LangChain service docs: [`apps/langchain-service/README.md`](langchain-service/README.md)

## Local Start Order

1. Start `langchain-service` (port `8000`)
2. Start `api` (port `4000`)
3. Start `web` (port `3000`)

## Environment Templates

- [`apps/api/.env.example`](api/.env.example)
- [`apps/web/.env.example`](web/.env.example)
- [`apps/langchain-service/.env.example`](langchain-service/.env.example)


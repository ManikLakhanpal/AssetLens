# LangChain Service (`apps/langchain-service`)

FastAPI + LangChain service used by the Node API (`apps/api`) for:

- **`POST /summarize`:** Portfolio snapshot → natural language summary (model: `chatgpt` or `gemini`).
- **`POST /chat`:** Chat completion with tools that map to **AssetLens Node API** routes (GET portfolio/Binance/Zerodha, POST convert/transfer/place-order, etc.).

The Node `/ai/*` handlers run **after** JWT authentication and pass a **per-user** portfolio snapshot into FastAPI, so summaries and chat context reflect the logged-in account.

## Endpoints

### `POST /summarize`

Input:

```json
{
  "snapshot": {},
  "model": "chatgpt"
}
```

Output:

```json
{
  "summary": "..."
}
```

### `POST /chat`

Input:

```json
{
  "message": "How is my portfolio doing?",
  "model": "gemini",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "portfolio_context_markdown": "..."
}
```

Output:

```json
{
  "reply": "..."
}
```

## Environment variables

Use [`.env.example`](.env.example) as template.

**Required (at least one model):**

- `OPENAI_API_KEY` (for ChatGPT)
- `GEMINI_API_KEY` (for Gemini) or `GOOGLE_API_KEY`

**Optional:**

- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `GEMINI_MODEL` (default `gemini-1.5-flash`)
- `OPENAI_TEMPERATURE` (default `0.2`)
- `GEMINI_TEMPERATURE` (default `0.2`)

**Node API bridge** (for tool HTTP calls to `apps/api`):

- `ASSETLENS_API_BASE_URL` — base URL for Node tool HTTP calls (`app/config.py`, default `http://localhost:4000`).

## Local development

```bash
cd apps/langchain-service
uv sync
uv run --env-file .env uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

If your local `uv` build does not support `--env-file`, load env in the shell and run:

```bash
set -a
source .env
set +a
uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Tooling note

Allowlisted Node routes used by LangChain tools are defined in `app/api_fetch.py` (GET/POST path sets). Portfolio chart data is exposed as a single tool hitting `GET /portfolio/data` (replacing separate summary/assets GETs). New protected broker routes on the Node API may need matching allowlist updates if tools should call them.

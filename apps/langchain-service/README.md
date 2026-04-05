# LangChain Service (`apps/langchain-service`)

FastAPI + LangChain service used by the Node API for:

- `POST /chat`: Chat completion with dynamically generated tools mapping to the Node API.
  - Supports fetching live context (`/portfolio/summary`, `/binance/funding-account-data`, etc.)
  - Supports making state changes via bound Action Tools (e.g. `post_binance_convert` and `post_binance_transfer`) natively translating intent to HTTP POST requests.

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

## Environment Variables

Use [`apps/langchain-service/.env.example`](.env.example) as template.

Required:

- `OPENAI_API_KEY` (for ChatGPT)
- `GEMINI_API_KEY` (for Gemini) or `GOOGLE_API_KEY`

Optional:

- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `GEMINI_MODEL` (default `gemini-1.5-flash`)
- `OPENAI_TEMPERATURE` (default `0.2`)
- `GEMINI_TEMPERATURE` (default `0.2`)

## Local Development

```bash
cd apps/langchain-service
uv sync
uv run --env-file .env uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

If your local `uv` build does not support `--env-file`, load env in shell and run:

```bash
set -a
source .env
set +a
uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```


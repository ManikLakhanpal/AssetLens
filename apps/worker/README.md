# AssetLens worker

Background worker that sends portfolio email updates every 2 hours.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts

- `npm run dev` — start worker with hot reload
- `npm run job:once -- --userId=<id>` — run a single email job for one user
- `npm start` — production start

## Environment

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection (BullMQ) |
| `API_BASE_URL` | Express API base URL (default `http://localhost:4000`) |
| `WORKER_SECRET` | Optional shared secret for internal API routes |
| `WORKER_CONCURRENCY` | Max parallel email jobs (default `3`) |

Requires `RESEND_API_KEY` and `EMAIL_FROM` on the API service.

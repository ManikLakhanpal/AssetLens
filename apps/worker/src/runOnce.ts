import "dotenv/config";
import { startWorker } from "./worker.js";

const userId = process.argv.find((a) => a.startsWith("--userId="))?.split("=")[1];

if (!userId) {
  console.error("Usage: npm run job:once -- --userId=<userId>");
  process.exit(1);
}

async function runOnce() {
  const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";
  const WORKER_SECRET = process.env.WORKER_SECRET;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (WORKER_SECRET) headers["X-Worker-Secret"] = WORKER_SECRET;

  const res = await fetch(`${API_BASE_URL}/internal/notifications/run/${userId}?skipCooldown=true`, {
    method: "POST",
    headers,
  });
  const body = await res.text();
  console.log(res.status, body);
  if (!res.ok) process.exit(1);
}

runOnce().catch((err) => {
  console.error(err);
  process.exit(1);
});

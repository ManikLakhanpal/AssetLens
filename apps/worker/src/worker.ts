import { Worker, Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";
const WORKER_SECRET = process.env.WORKER_SECRET;

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export const PORTFOLIO_EMAIL_QUEUE = "portfolio-email-update";
export const SCHEDULER_QUEUE = "portfolio-email-scheduler";

export const portfolioEmailQueue = new Queue(PORTFOLIO_EMAIL_QUEUE, { connection });
export const schedulerQueue = new Queue(SCHEDULER_QUEUE, { connection });

function hourBucket(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${Math.floor(d.getUTCHours() / 2)}`;
}

async function triggerEligibleUsers() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (WORKER_SECRET) {
    headers["X-Worker-Secret"] = WORKER_SECRET;
  }

  const res = await fetch(`${API_BASE_URL}/internal/notifications/eligible-users`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch eligible users: ${res.status} ${await res.text()}`);
  }

  const { userIds } = (await res.json()) as { userIds: string[] };

  for (const userId of userIds) {
    await portfolioEmailQueue.add(
      "portfolio-email-update",
      { userId },
      {
        jobId: `email-update-${userId}-${hourBucket()}`,
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
      }
    );
  }

  console.log(`[scheduler] Enqueued ${userIds.length} portfolio email jobs`);
}

async function processPortfolioEmail(userId: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (WORKER_SECRET) {
    headers["X-Worker-Secret"] = WORKER_SECRET;
  }

  const res = await fetch(`${API_BASE_URL}/internal/notifications/run/${userId}`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Job failed for ${userId}: ${res.status} ${text}`);
  }

  const result = (await res.json()) as { status: string; reason?: string };
  console.log(`[worker] user=${userId} status=${result.status}${result.reason ? ` reason=${result.reason}` : ""}`);
}

export async function startWorker() {
  const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 3);

  await schedulerQueue.add(
    "tick",
    {},
    {
      repeat: { pattern: "0 */2 * * *" },
      jobId: "portfolio-email-scheduler",
      removeOnComplete: true,
      removeOnFail: 10,
    }
  );

  const schedulerWorker = new Worker(
    SCHEDULER_QUEUE,
    async () => {
      await triggerEligibleUsers();
    },
    { connection, concurrency: 1 }
  );

  const emailWorker = new Worker(
    PORTFOLIO_EMAIL_QUEUE,
    async (job) => {
      const { userId } = job.data as { userId: string };
      await processPortfolioEmail(userId);
    },
    { connection, concurrency }
  );

  const events = new QueueEvents(PORTFOLIO_EMAIL_QUEUE, { connection });
  events.on("failed", ({ jobId, failedReason }) => {
    console.error(`[worker] job ${jobId} failed: ${failedReason}`);
  });

  schedulerWorker.on("failed", (job, err) => {
    console.error(`[scheduler] job ${job?.id} failed:`, err);
  });

  console.log(`[worker] Started (concurrency=${concurrency}, redis=${REDIS_URL})`);
}

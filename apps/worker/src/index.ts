import "dotenv/config";
import { startWorker } from "./worker.js";

startWorker().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});

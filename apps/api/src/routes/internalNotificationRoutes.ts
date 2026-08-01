import { Router, type Request, type Response, type NextFunction } from "express";
import { getEligibleUsers, runPortfolioEmailUpdate } from "../services/notifications/notificationService.js";

const router = Router();

function workerAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.WORKER_SECRET;
  if (!secret) {
    next();
    return;
  }
  const header = req.headers["x-worker-secret"];
  if (header !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.use(workerAuth);

router.get("/eligible-users", async (_req, res) => {
  try {
    const users = await getEligibleUsers();
    res.json({ userIds: users.map((u) => u.id) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.post("/run/:userId", async (req, res) => {
  try {
    const skipCooldown = req.query.skipCooldown === "true";
    const result = await runPortfolioEmailUpdate(req.params.userId, { skipCooldown });
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;

import { Router } from "express";
import {
  getPreferencesHandler,
  updatePreferencesHandler,
  sendTestEmailHandler,
  getLogsHandler,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/preferences", getPreferencesHandler);
router.put("/preferences", updatePreferencesHandler);
router.post("/test", sendTestEmailHandler);
router.get("/logs", getLogsHandler);

export default router;

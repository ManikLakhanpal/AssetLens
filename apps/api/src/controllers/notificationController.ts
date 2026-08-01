import type { Request, Response } from "express";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestPortfolioEmail,
  getNotificationLogs,
} from "../services/notifications/notificationService.js";
import type { UpdateNotificationPreferencesInput } from "../dto/notification.dto.js";

export async function getPreferencesHandler(req: Request, res: Response) {
  try {
    const prefs = await getNotificationPreferences(req.userId);
    res.json(prefs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch preferences";
    res.status(500).json({ error: message });
  }
}

export async function updatePreferencesHandler(req: Request, res: Response) {
  const body = req.body as UpdateNotificationPreferencesInput;

  if (body.model !== undefined && body.model !== "chatgpt" && body.model !== "gemini") {
    res.status(400).json({ error: "model must be 'chatgpt' or 'gemini'" });
    return;
  }

  try {
    const prefs = await updateNotificationPreferences(req.userId, body);
    res.json(prefs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    const status = message === "Invalid email address" ? 400 : 500;
    res.status(status).json({ error: message });
  }
}

export async function sendTestEmailHandler(req: Request, res: Response) {
  try {
    const prefs = await getNotificationPreferences(req.userId);
    if (!prefs.email) {
      res.status(400).json({ error: "Set an email address in notification settings first" });
      return;
    }

    const result = await sendTestPortfolioEmail(req.userId);
    if (result.status === "failed") {
      res.status(500).json({ error: result.reason ?? "Failed to send test email" });
      return;
    }
    if (result.status === "skipped") {
      res.status(400).json({ error: result.reason ?? "Email was skipped" });
      return;
    }
    res.json({ message: "Test email sent" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send test email";
    res.status(500).json({ error: message });
  }
}

export async function getLogsHandler(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const logs = await getNotificationLogs(req.userId, limit);
    res.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch logs";
    res.status(500).json({ error: message });
  }
}

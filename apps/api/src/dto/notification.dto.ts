import type { Model } from "../dto/ai.dto.js";

export type NotificationPreferencesResponse = {
  email: string | null;
  enabled: boolean;
  intervalHours: number;
  model: Model;
  timezone: string;
};

export type UpdateNotificationPreferencesInput = {
  email?: string | null;
  enabled?: boolean;
  model?: Model;
};

export type NotificationLogEntry = {
  id: string;
  status: string;
  reason: string | null;
  createdAt: string;
};

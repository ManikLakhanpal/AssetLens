import prisma from "../../db/prisma.js";
import { collectPortfolioSnapshot } from "../portfolio/portfolioSnapshotService.js";
import {
  computePortfolioDelta,
  computeTotalInr,
  type PortfolioDelta,
} from "../portfolio/portfolioDeltaService.js";
import { fastApiClient } from "../fastApiClient.js";
import { sendPortfolioEmail } from "../email/emailService.js";
import type { Model } from "../../dto/ai.dto.js";
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesInput,
} from "../../dto/notification.dto.js";
import type { PortfolioSnapshotInput } from "../../dto/portfolio.dto.js";

const EMAIL_COOLDOWN_MS = 90 * 60 * 1000;

function isZerodhaAuthRequired(snapshot: PortfolioSnapshotInput): boolean {
  const slices = [
    snapshot.zerodhaProfile,
    snapshot.zerodhaHoldings,
    snapshot.mfHoldings,
    snapshot.mfSips,
  ];
  return slices.some(
    (s) =>
      typeof s === "object" &&
      s !== null &&
      "success" in s &&
      (s as { success: unknown }).success === false &&
      (s as { code?: string }).code === "AUTH_REQUIRED"
  );
}

async function userHasBrokerCredentials(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { binance: true, zerodha: true },
  });
  return Boolean(user?.binance || user?.zerodha);
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferencesResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreferences: true },
  });
  if (!user) throw new Error("User not found");

  const prefs = user.notificationPreferences;
  return {
    email: user.email,
    enabled: prefs?.enabled ?? false,
    intervalHours: prefs?.intervalHours ?? 2,
    model: (prefs?.model as Model) ?? "chatgpt",
    timezone: prefs?.timezone ?? "UTC",
  };
}

export async function updateNotificationPreferences(
  userId: string,
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferencesResponse> {
  if (input.email !== undefined) {
    const email = input.email?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }

  if (input.enabled !== undefined || input.model !== undefined) {
    await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        enabled: input.enabled ?? false,
        model: input.model ?? "chatgpt",
      },
      update: {
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
      },
    });
  }

  return getNotificationPreferences(userId);
}

export async function getEligibleUsers() {
  return prisma.user.findMany({
    where: {
      email: { not: null },
      notificationPreferences: { enabled: true },
    },
    include: {
      notificationPreferences: true,
      binance: true,
      zerodha: true,
    },
  });
}

async function loadPreviousSnapshot(userId: string) {
  return prisma.portfolioSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function saveSnapshot(userId: string, snapshot: PortfolioSnapshotInput) {
  const totalInr = computeTotalInr(snapshot);
  await prisma.portfolioSnapshot.deleteMany({ where: { userId } });
  await prisma.portfolioSnapshot.create({
    data: {
      userId,
      data: snapshot as object,
      totalInr,
    },
  });
}

async function logNotification(userId: string, status: string, reason?: string) {
  await prisma.notificationLog.create({
    data: { userId, status, reason },
  });
}

async function wasRecentlyNotified(userId: string): Promise<boolean> {
  const recent = await prisma.notificationLog.findFirst({
    where: {
      userId,
      status: "sent",
      createdAt: { gte: new Date(Date.now() - EMAIL_COOLDOWN_MS) },
    },
  });
  return Boolean(recent);
}

export async function runPortfolioEmailUpdate(
  userId: string,
  options?: { skipCooldown?: boolean; skipEnabledCheck?: boolean }
): Promise<{ status: "sent" | "skipped" | "failed"; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreferences: true },
  });

  if (!user) {
    return { status: "failed", reason: "User not found" };
  }

  if (!options?.skipEnabledCheck && !user.notificationPreferences?.enabled) {
    await logNotification(userId, "skipped", "Notifications disabled");
    return { status: "skipped", reason: "Notifications disabled" };
  }

  if (!user.email) {
    await logNotification(userId, "skipped", "No email configured");
    return { status: "skipped", reason: "No email configured" };
  }

  if (!options?.skipCooldown && (await wasRecentlyNotified(userId))) {
    await logNotification(userId, "skipped", "Cooldown active");
    return { status: "skipped", reason: "Cooldown active" };
  }

  const hasCredentials = await userHasBrokerCredentials(userId);
  if (!hasCredentials) {
    await logNotification(userId, "skipped", "No broker credentials");
    return { status: "skipped", reason: "No broker credentials" };
  }

  try {
    const snapshot = await collectPortfolioSnapshot(userId);
    const previousRow = await loadPreviousSnapshot(userId);
    const previousSnapshot = previousRow?.data as PortfolioSnapshotInput | undefined;
    const delta: PortfolioDelta = computePortfolioDelta(
      previousSnapshot ?? null,
      snapshot,
      previousRow?.createdAt ?? null
    );

    const model = (user.notificationPreferences?.model as Model) ?? "chatgpt";
    const { summary } = await fastApiClient.summarize({
      snapshot,
      delta,
      model,
      periodicUpdate: true,
    });

    let subject = `AssetLens portfolio update — ${new Date().toUTCString()}`;
    if (isZerodhaAuthRequired(snapshot)) {
      subject = `AssetLens portfolio update (Zerodha re-login needed)`;
    }

    const settingsUrl = process.env.WEB_BASE_URL
      ? `${process.env.WEB_BASE_URL.replace(/\/$/, "")}/settings`
      : undefined;

    await sendPortfolioEmail({
      to: user.email,
      subject,
      summaryMarkdown: summary,
      username: user.username,
      settingsUrl,
    });

    await saveSnapshot(userId, snapshot);
    await logNotification(userId, "sent");
    return { status: "sent" };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    await logNotification(userId, "failed", reason);
    return { status: "failed", reason };
  }
}

export async function sendTestPortfolioEmail(userId: string) {
  return runPortfolioEmailUpdate(userId, {
    skipCooldown: true,
    skipEnabledCheck: true,
  });
}

export async function getNotificationLogs(userId: string, limit = 10) {
  const logs = await prisma.notificationLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs.map((l) => ({
    id: l.id,
    status: l.status,
    reason: l.reason,
    createdAt: l.createdAt.toISOString(),
  }));
}

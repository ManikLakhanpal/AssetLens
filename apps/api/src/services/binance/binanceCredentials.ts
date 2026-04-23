import redis from "../../db/redis.js";
import prisma from "../../db/prisma.js";
import { decrypt } from "../auth/cryptoService.js";

/**
 * Loads and caches Binance API credentials for a single user.
 * Never use findFirst() or a global Redis key — that would leak accounts across users.
 */
export async function getBinanceCredentialsForUser(
  userId: string
) {
  const cacheKey = `binance:credentials:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as { apiKey: string; apiSecret: string };
  }

  const creds = await prisma.binanceCredentials.findUnique({ where: { userId } });
  if (!creds) throw new Error("Binance credentials not found in database");

  const result = {
    apiKey: decrypt(creds.apiKey),
    apiSecret: decrypt(creds.apiSecret),
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
  return result;
}

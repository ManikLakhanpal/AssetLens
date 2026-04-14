import { KiteConnect } from "kiteconnect";
import type { Connect } from "kiteconnect";
import redis from "../../db/redis.js";
import prisma from "../../db/prisma.js";
import { decrypt } from "../auth/cryptoService.js";

/**
 * Kite client with only api_key — no access token set.
 * Required for `generateSession(request_token, api_secret)` on first login
 * (createKiteClient would throw before any daily token exists).
 */
export async function createKiteConnectForSessionExchange(userId: string): Promise<Connect> {
  const zerodha = await prisma.zerodhaCredentials.findUnique({ where: { userId } });
  if (!zerodha) throw new Error("Zerodha credentials not found in database");

  const apiKey = decrypt(zerodha.apiKey);
  return new KiteConnect({ api_key: apiKey });
}

/**
 * Returns a KiteConnect client scoped to the given user.
 * Access token is sourced from Redis first (fast path), then decrypted from DB.
 * Falls back to the env var during initial setup before any token has been stored.
 */
export async function createKiteClient(userId: string): Promise<Connect> {
  const zerodha = await prisma.zerodhaCredentials.findUnique({ where: { userId } });
  if (!zerodha) throw new Error("Zerodha credentials not found in database");

  const apiKey = decrypt(zerodha.apiKey);
  const client = new KiteConnect({ api_key: apiKey });

  const redisKey = `zerodha:access_token:${userId}`;

  const cachedToken = await redis.get(redisKey);
  if (cachedToken) {
    client.setAccessToken(decrypt(cachedToken));
    return client;
  }

  if (zerodha.accessToken) {
    const token = decrypt(zerodha.accessToken);
    await redis.set(redisKey, zerodha.accessToken, "EX", 86400);
    client.setAccessToken(token);
    return client;
  }

  const envToken = process.env.ZERODHA_ACCESS_TOKEN;
  if (envToken) {
    client.setAccessToken(envToken);
    return client;
  }

  throw new Error("Zerodha daily token not configured. Generate it via /zerodha/generate-token.");
}

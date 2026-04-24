import redis from "../../db/redis.js";
import prisma from "../../db/prisma.js";
import { decrypt, encrypt } from "../auth/cryptoService.js";

/**
 * Loads and caches Binance API credentials for a single user.
 */
export async function getBinanceCredentialsForUser(userId: string) {
  const cacheKey = `binance:credentials:${userId}`;
  const cached = await redis.get(cacheKey);

  // * 1. If credentials are cached, decrypt and return it
  if (cached) {
    const decrypted = JSON.parse(decrypt(cached));

    return decrypted as { apiKey: string; apiSecret: string };
  }

  // * 2. If not cached, load from DB
  const creds = await prisma.binanceCredentials.findUnique({ where: { userId } });
  if (!creds) { 
    throw new Error("Binance credentials not found in database");
  }

  // * 3. Decrypt credentials, cache them, and return
  const result = {
    apiKey: decrypt(creds.apiKey),
    apiSecret: decrypt(creds.apiSecret),
  };

  // * 4. Cache the decrypted credentials for 1 hour and return it
  const encryptedResult = encrypt(JSON.stringify(result));
  await redis.set(cacheKey, encryptedResult, "EX", 3600);

  return result;
}

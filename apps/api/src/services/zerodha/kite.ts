import { KiteConnect } from "kiteconnect";
import redis from "../../db/redis.js";
import prisma from "../../db/prisma.js";
import { decrypt, encrypt } from "../auth/cryptoService.js";

/**
 * Kite client with only api_key — no access token set.
 * Required for `generateSession(request_token, api_secret)` on first login
 * (createKiteClient would throw before any daily token exists).
 */
export async function createKiteConnectForSessionExchange(userId: string) {
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
export async function createKiteClient(userId: string) {
  const redisKey = `zerodha:creds:${userId}`;
  const cached = await redis.get(redisKey);

  // * 1. If credentials are cached, decrypt and return it
  if (cached) {
    const { apiKey, accessToken } = JSON.parse(decrypt(cached));
    
    const client = new KiteConnect({ api_key: apiKey });
    client.setAccessToken(accessToken);
    return client;
  }

  // * 2. If not cached, load from DB
  const zerodha = await prisma.zerodhaCredentials.findUnique({ where: { userId } });
  if (!zerodha) { 
    throw new Error("Zerodha credentials not found in database");
  }

  const decryptedApiKey = decrypt(zerodha.apiKey);
  const client = new KiteConnect({ api_key: decryptedApiKey });

  // * 3. Handle Token Logic
  let decryptedToken: string;

  if (zerodha.accessToken) {
    decryptedToken = decrypt(zerodha.accessToken);
  } else {
    throw new Error("No access token available. Please re-authenticate.");
  }

  // * 4. Set token on client
  client.setAccessToken(decryptedToken);

  // * 5. Sync back to Redis: Store both together for the next call after encryption
  const sessionData = {
    apiKey: decryptedApiKey,
    accessToken: decryptedToken
  };
  const encryptedSession = encrypt(JSON.stringify(sessionData));
  
  // Cache for 24 hours (86400s)
  await redis.set(redisKey, encryptedSession, "EX", 86400);

  return client;
}
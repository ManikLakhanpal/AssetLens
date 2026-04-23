import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma.js";
import redis from "../../db/redis.js";
import { encrypt, decrypt } from "./cryptoService.js";
import type { MeResponse, SaveCredentialsInput } from "../../dto/auth.dto.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  return secret;
}

export type JwtPayload = {
  userId: string;
  username: string;
};

/**
 * Creates a new user account and returns a signed JWT.
 * Throws if the username is already taken.
 */
export async function register(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already taken");

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, password: hashed } });

  const payload: JwtPayload = { userId: user.id, username: user.username };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

/**
 * Validates username/password and returns a signed JWT on success.
 * Throws if credentials are invalid.
 */
export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const payload: JwtPayload = { userId: user.id, username: user.username };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

/**
 * Returns decrypted Binance and Zerodha credentials for the given user.
 * Returns null for a wallet if the user has not stored credentials for it.
 */
export async function getUserCredentials(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { binance: true, zerodha: true },
  });

  if (!user) throw new Error("User not found");

  const binance = user.binance
    ? {
        apiKey: decrypt(user.binance.apiKey),
        apiSecret: decrypt(user.binance.apiSecret),
      }
    : null;

  const zerodha = user.zerodha
    ? {
        apiKey: decrypt(user.zerodha.apiKey),
        apiSecret: decrypt(user.zerodha.apiSecret),
        accessToken: user.zerodha.accessToken
          ? decrypt(user.zerodha.accessToken)
          : null,
      }
    : null;

  return { binance, zerodha };
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

/**
 * Returns profile info and credential presence flags for the given user.
 */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { binance: true, zerodha: true },
  });

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
    hasBinance: user.binance !== null,
    hasZerodha: user.zerodha !== null,
  };
}

/**
 * Upserts Binance and/or Zerodha credentials for the given user.
 * Each provider is saved independently — passing only one does not affect the other.
 */
export async function saveCredentials(
  userId: string,
  input: SaveCredentialsInput
) {
  if (input.binance) {
    await prisma.binanceCredentials.upsert({
      where: { userId },
      create: {
        userId,
        apiKey: encrypt(input.binance.apiKey),
        apiSecret: encrypt(input.binance.apiSecret),
      },
      update: {
        apiKey: encrypt(input.binance.apiKey),
        apiSecret: encrypt(input.binance.apiSecret),
      },
    });
  }

  if (input.zerodha) {
    await prisma.zerodhaCredentials.upsert({
      where: { userId },
      create: {
        userId,
        apiKey: encrypt(input.zerodha.apiKey),
        apiSecret: encrypt(input.zerodha.apiSecret),
      },
      update: {
        apiKey: encrypt(input.zerodha.apiKey),
        apiSecret: encrypt(input.zerodha.apiSecret),
      },
    });
  }

  if (input.binance || input.zerodha) {
    await redis.del(`portfolio:summary:${userId}`, `portfolio:assets:${userId}`);
  }

  if (input.binance) {
    await redis.del(`binance:inr:${userId}`, `binance:credentials:${userId}`);
  }
}

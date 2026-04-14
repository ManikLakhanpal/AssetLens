import { Wallet } from "@binance/wallet";
import redis from "../../db/redis.js";
import prisma from "../../db/prisma.js";
import { decrypt } from "../auth/cryptoService.js";

async function getBinanceCredentials(): Promise<{ apiKey: string; apiSecret: string }> {
  const cached = await redis.get("binance:credentials");
  if (cached) {
    return JSON.parse(cached) as { apiKey: string; apiSecret: string };
  }

  const creds = await prisma.binanceCredentials.findFirst();
  if (!creds) throw new Error("Binance credentials not found in database");

  const result = {
    apiKey: decrypt(creds.apiKey),
    apiSecret: decrypt(creds.apiSecret),
  };

  await redis.set("binance:credentials", JSON.stringify(result), "EX", 3600);
  return result;
}

export async function createWalletClient(): Promise<Wallet> {
  const { apiKey, apiSecret } = await getBinanceCredentials();
  return new Wallet({ configurationRestAPI: { apiKey, apiSecret } });
}

import { Wallet } from "@binance/wallet";
import { getBinanceCredentialsForUser } from "./binanceCredentials.js";

export async function createWalletClient(userId: string) {
  const { apiKey, apiSecret } = await getBinanceCredentialsForUser(userId);

  return new Wallet({ 
    configurationRestAPI: { apiKey, apiSecret } 
  });
}

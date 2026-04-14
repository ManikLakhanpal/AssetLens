import { Spot } from "@binance/spot";
import { getBinanceCredentialsForUser } from "./binanceCredentials.js";

export async function createSpotClient(userId: string): Promise<Spot> {
  const { apiKey, apiSecret } = await getBinanceCredentialsForUser(userId);
  return new Spot({ configurationRestAPI: { apiKey, apiSecret } });
}

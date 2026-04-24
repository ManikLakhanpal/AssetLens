import { createWalletClient } from "./wallet.js";
import { createSpotClient } from "./spot.js";

type BinanceRequestError = {
  response?: { data?: { msg?: string } };
  message?: string;
};

function extractErrorMessage(error: unknown): string {
  const err = error as BinanceRequestError;
  return err.response?.data?.msg ?? err.message ?? "Request failed";
}

// * Funding Wallet Balance
export async function fundingWalletBalance(userId: string) {
  try {
    const walletClient = await createWalletClient(userId);
    const response = await walletClient.restAPI.fundingWallet();

    console.log("fundingWallet() rate limits:", response.rateLimits!);

    const data = await response.data();
    console.log("fundingWallet() response:", data);
    
    return data;
  } catch (error) {
    console.error((error as BinanceRequestError).response?.data ?? (error as BinanceRequestError).message);
    throw new Error(extractErrorMessage(error));
  }
}

// * Convert Asset (Spot Market Order)
export async function convertAsset(
  userId: string,
  symbol: string,
  side: "BUY" | "SELL",
  amount: number
) {
  try {
    const spotClient = await createSpotClient(userId);
    const response = await spotClient.restAPI.newOrder({
      symbol,
      side: side as any,
      type: "MARKET" as any,
      quoteOrderQty: amount,
    });
    const data = await response.data();
    console.log("Conversion successful:", data);
    return data;
  } catch (error) {
    console.error("Trade failed:", (error as BinanceRequestError).response?.data ?? (error as BinanceRequestError).message);
    throw new Error(extractErrorMessage(error));
  }
}

// * API Key Permissions
export async function permissions(userId: string) {
  try {
    const walletClient = await createWalletClient(userId);
    const response = await walletClient.restAPI.getApiKeyPermission();
    console.log("permissions() rate limits:", response.rateLimits!);
    const data = await response.data();
    console.log("permissions() response:", data);
    return data;
  } catch (error) {
    console.error((error as BinanceRequestError).response?.data ?? (error as BinanceRequestError).message);
    throw new Error(extractErrorMessage(error));
  }
}

// * Spot Account Information
export async function spotAccountInfo(userId: string) {
  try {
    const spotClient = await createSpotClient(userId);
    const response = await spotClient.restAPI.getAccount();
    console.log("spotAccountInfo() rate limits:", response.rateLimits!);
    const data = await response.data();
    console.log("spotAccountInfo() response:", data);
    return data;
  } catch (error) {
    console.error((error as BinanceRequestError).response?.data ?? (error as BinanceRequestError).message);
    throw new Error(extractErrorMessage(error));
  }
}

// * Universal Asset Transfer (Spot ↔ Funding)
export async function transferAsset(
  userId: string,
  type: "MAIN_FUNDING" | "FUNDING_MAIN",
  asset: string,
  amount: number
) {
  try {
    const walletClient = await createWalletClient(userId);
    const response = await walletClient.restAPI.userUniversalTransfer({ type, asset, amount });
    console.log("transferAsset() rate limits:", response.rateLimits!);
    const data = await response.data();
    console.log("transferAsset() response:", data);
    return data;
  } catch (error) {
    console.error((error as BinanceRequestError).response?.data ?? (error as BinanceRequestError).message);
    throw new Error(extractErrorMessage(error));
  }
}

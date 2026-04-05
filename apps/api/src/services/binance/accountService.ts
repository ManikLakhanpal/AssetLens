import walletClient from "./wallet";
import spotClient from "./spot";

// * Funding Wallet Information
export async function fundingWalletBalance() {
  try {
    const response = await walletClient.restAPI.fundingWallet();

    const rateLimits = response.rateLimits!;
    console.log("fundingWallet() rate limits:", rateLimits);

    const data = await response.data();
    console.log("fundingWallet() response:", data);

    return data;
  } catch (error) {
    const err = error as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    console.error(err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}

export async function convertAsset(symbol: string, side: "BUY" | "SELL", amount: number) {
  try {
    const response = await spotClient.restAPI.newOrder({
      symbol: symbol,
      side: side as any,
      type: "MARKET" as any,
      // Since amount represents amount to spend for BUYs, and quantity for SELLs,
      // wait, the user said amount means "how much I want to spend".
      // If side is SELL, "how much I want to spend" doesn't strictly formulate to a quoteOrderQty unless we are specifying the target currency. But typically if you want to swap $10 of USDT to BTC, it's quoteOrderQty for BUY, but if you want to sell your BTC to get USDT, the "amount to spend" means "how much of the quote asset to receive" OR "how much of the base asset to get rid of". Usually, `quoteOrderQty` works for both BUY and SELL sides on Binance! 
      // It always specifies the amount in terms of the quote asset (USDT). For example, SELL MARKET quoteOrderQty=10 means "sell enough BTC such that I receive 10 USDT".
      quoteOrderQty: amount 
    });
    const data = await response.data();
    console.log("Conversion successful:", data);
    return data;
  } catch (error) {
    const err = error as any;
    console.error("Trade failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}

export async function permissions() {
  try {
    const response = await walletClient.restAPI.getApiKeyPermission();

    const rateLimits = response.rateLimits!;
    console.log("permissions() rate limits:", rateLimits);

    const data = await response.data();
    console.log("permissions() response:", data);

    return data;
  } catch (error) {
    const err = error as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    console.error(err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}


// * User Account Information
export async function spotAccountInfo() {
  try {
    const response = await spotClient.restAPI.getAccount();

    const rateLimits = response.rateLimits!;
    console.log("spotAccountInfo() rate limits:", rateLimits);

    const data = await response.data();
    console.log("spotAccountInfo() response:", data);

    return data;
  } catch (error) {
    const err = error as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    console.error(err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}

export async function transferAsset(type: "MAIN_FUNDING" | "FUNDING_MAIN", asset: string, amount: number) {
  try {
    const response = await walletClient.restAPI.userUniversalTransfer({
      type,
      asset,
      amount
    });

    const rateLimits = response.rateLimits!;
    console.log("transferAsset() rate limits:", rateLimits);

    const data = await response.data();
    console.log("transferAsset() response:", data);

    return data;
  } catch (error) {
    const err = error as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    console.error(err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}
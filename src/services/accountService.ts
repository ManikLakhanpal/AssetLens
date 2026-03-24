import walletClient from "./binance/wallet";

// * Funding Wallet Information
export async function fundingWalletInfo() {
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

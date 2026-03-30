import walletClient from "./binance/wallet";
import { getCryptoPricesInr } from "./coingecko/prices";

export interface BinanceAssetInr {
  symbol: string;
  quantity: number;
  price_inr: number;
  value_inr: number;
}

export interface BinancePortfolioInr {
  assets: BinanceAssetInr[];
  total_inr: number;
}

/**
 * Fetches the Binance funding wallet balance and converts each asset
 * to INR using live CoinGecko prices.
 */
export async function getBinancePortfolioInr() {
  // Fetch funding wallet (includes all crypto held on Binance)
  const response = await walletClient.restAPI.fundingWallet();
  const raw = await response.data() as Array<{ asset: string; free: string; locked: string }>;

  const activeAssets = raw.filter(
    (a) => parseFloat(a.free) > 0 || parseFloat(a.locked) > 0
  );

  const symbols = activeAssets.map((a) => a.asset);
  const prices = await getCryptoPricesInr(symbols);

  const assets: BinanceAssetInr[] = activeAssets.map((a) => {
    const qty = parseFloat(a.free) + parseFloat(a.locked);
    const price_inr = prices[a.asset.toUpperCase()] ?? 0;
    return {
      symbol: a.asset,
      quantity: qty,
      price_inr,
      value_inr: qty * price_inr,
    };
  });

  // Sort by value descending
  assets.sort((a, b) => b.value_inr - a.value_inr);

  const total_inr = assets.reduce((sum, a) => sum + a.value_inr, 0);
  return { assets, total_inr };
}

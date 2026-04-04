import walletClient from "./wallet";
import spotClient from "./spot";
import { getCryptoPricesInr } from "../coingecko/prices";

export interface BinanceAssetInr {
  symbol: string;
  quantity: number;
  price_inr: number;
  value_inr: number;
}

export interface BinancePortfolioInr {
  assets: BinanceAssetInr[];
  total_inr: number;
  funding: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
  spot: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
}

let cachedPortfolio: BinancePortfolioInr | null = null;
let lastFetchTime = 0;
let fetchPromise: Promise<BinancePortfolioInr> | null = null;

const CACHE_TTL_MS = 60000; // 60 seconds

/**
 * Fetches the Binance funding and spot wallet balances and converts each asset
 * to INR using live CoinGecko prices. Results are cached for 60 seconds.
 */
export async function getBinancePortfolioInr(): Promise<BinancePortfolioInr> {
  const now = Date.now();
  if (cachedPortfolio && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedPortfolio;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const fundingResponse = await walletClient.restAPI.fundingWallet();
      const spotResponse = await spotClient.restAPI.getAccount();

      const fundingRaw = await fundingResponse.data() as Array<{ asset: string; free: string; locked: string }>;
      const spotData = await spotResponse.data() as { balances: Array<{ asset: string; free: string; locked: string }> };
      const spotRaw = spotData.balances || [];

      const extractAssets = (items: Array<{ asset: string; free: string; locked: string }>) => {
        const map = new Map<string, { free: number; locked: number }>();
        for (const item of items) {
          const free = parseFloat(item.free) || 0;
          const locked = parseFloat(item.locked) || 0;
          if (free > 0 || locked > 0) {
            const existing = map.get(item.asset) || { free: 0, locked: 0 };
            map.set(item.asset, {
              free: existing.free + free,
              locked: existing.locked + locked,
            });
          }
        }
        return map;
      };

      const fundingMap = extractAssets(fundingRaw);
      const spotMap = extractAssets(spotRaw);

      const combinedMap = new Map<string, { free: number; locked: number }>();
      for (const [asset, data] of fundingMap.entries()) {
        combinedMap.set(asset, { free: data.free, locked: data.locked });
      }
      for (const [asset, data] of spotMap.entries()) {
        const existing = combinedMap.get(asset) || { free: 0, locked: 0 };
        combinedMap.set(asset, {
          free: existing.free + data.free,
          locked: existing.locked + data.locked,
        });
      }

      const symbols = Array.from(combinedMap.keys());
      const prices = await getCryptoPricesInr(symbols);

      const toInrAssets = (map: Map<string, { free: number; locked: number }>): BinanceAssetInr[] => {
        return Array.from(map.entries())
          .map(([symbol, { free, locked }]) => {
            const qty = free + locked;
            const price_inr = prices[symbol.toUpperCase()] ?? 0;
            return {
              symbol,
              quantity: qty,
              price_inr,
              value_inr: qty * price_inr,
            };
          })
          .filter(a => a.quantity > 0)
          .sort((a, b) => b.value_inr - a.value_inr);
      };

      const fundingAssets = toInrAssets(fundingMap);
      const spotAssets = toInrAssets(spotMap);
      const combinedAssets = toInrAssets(combinedMap);

      const sumInr = (assets: BinanceAssetInr[]) => assets.reduce((sum, a) => sum + a.value_inr, 0);

      const result = {
        assets: combinedAssets,
        total_inr: sumInr(combinedAssets),
        funding: {
          assets: fundingAssets,
          total_inr: sumInr(fundingAssets),
        },
        spot: {
          assets: spotAssets,
          total_inr: sumInr(spotAssets),
        }
      };

      cachedPortfolio = result;
      lastFetchTime = Date.now();
      return result;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

import walletClient from "./wallet";
import spotClient from "./spot";
import { getCryptoPricesInr } from "../coingecko/prices";
import type { BinanceAssetInr, BinancePortfolioInr } from "../../dto/binance.dto";

export type { BinanceAssetInr, BinancePortfolioInr };

type RawBalance = { asset: string; free: string; locked: string };
type BalanceMap = Map<string, { free: number; locked: number }>;

/** Aggregates raw balance entries into a symbol → {free, locked} map, ignoring zero balances. */
function extractAssets(items: RawBalance[]): BalanceMap {
  const map: BalanceMap = new Map();
  for (const item of items) {
    const free = parseFloat(item.free) || 0;
    const locked = parseFloat(item.locked) || 0;
    if (free > 0 || locked > 0) {
      const existing = map.get(item.asset) ?? { free: 0, locked: 0 };
      map.set(item.asset, {
        free: existing.free + free,
        locked: existing.locked + locked,
      });
    }
  }
  return map;
}

/** Converts a balance map to INR-valued asset list using the provided price lookup. */
function toInrAssets(
  map: BalanceMap,
  prices: Record<string, number>
): BinanceAssetInr[] {
  return Array.from(map.entries())
    .map(([symbol, { free, locked }]) => {
      const quantity = free + locked;
      const price_inr = prices[symbol.toUpperCase()] ?? 0;
      return { symbol, quantity, price_inr, value_inr: quantity * price_inr };
    })
    .filter((a) => a.quantity > 0)
    .sort((a, b) => b.value_inr - a.value_inr);
}

function sumInr(assets: BinanceAssetInr[]): number {
  return assets.reduce((sum, a) => sum + a.value_inr, 0);
}

let cachedPortfolio: BinancePortfolioInr | null = null;
let lastFetchTime = 0;
let fetchPromise: Promise<BinancePortfolioInr> | null = null;

const CACHE_TTL_MS = 60_000;

/**
 * Fetches Binance funding and spot wallet balances and converts each asset
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
      const [fundingResponse, spotResponse] = await Promise.all([
        walletClient.restAPI.fundingWallet(),
        spotClient.restAPI.getAccount(),
      ]);

      const fundingRaw = (await fundingResponse.data()) as RawBalance[];
      const spotData = (await spotResponse.data()) as { balances: RawBalance[] };
      const spotRaw = spotData.balances ?? [];

      const fundingMap = extractAssets(fundingRaw);
      const spotMap = extractAssets(spotRaw);

      const combinedMap: BalanceMap = new Map(fundingMap);
      for (const [asset, data] of spotMap.entries()) {
        const existing = combinedMap.get(asset) ?? { free: 0, locked: 0 };
        combinedMap.set(asset, {
          free: existing.free + data.free,
          locked: existing.locked + data.locked,
        });
      }

      const prices = await getCryptoPricesInr(Array.from(combinedMap.keys()));

      const fundingAssets = toInrAssets(fundingMap, prices);
      const spotAssets = toInrAssets(spotMap, prices);
      const combinedAssets = toInrAssets(combinedMap, prices);

      const result: BinancePortfolioInr = {
        assets: combinedAssets,
        total_inr: sumInr(combinedAssets),
        funding: { assets: fundingAssets, total_inr: sumInr(fundingAssets) },
        spot: { assets: spotAssets, total_inr: sumInr(spotAssets) },
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

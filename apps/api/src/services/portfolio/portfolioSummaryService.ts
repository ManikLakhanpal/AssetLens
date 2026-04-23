import { getBinancePortfolioInr } from "../binance/binanceInrService.js";
import { getZerodhaHoldings, getZerodhaMFHoldings } from "../zerodha/zerodhaService.js";
import type { PortfolioSummary, AssetSlice } from "../../dto/portfolio.dto.js";
import redis from "../../db/redis.js";

export type { PortfolioSummary, AssetSlice };

const CACHE_TTL = 60;

/**
 * Fetches Binance and Zerodha values and returns a summary of each
 * exchange's total INR value. Results are cached in Redis for 60 seconds.
 * If Zerodha holdings fail (non-array service error), the result is not cached
 * so a later successful session is not masked by zeros for 60s.
 */
export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const cacheKey = `portfolio:summary:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as PortfolioSummary;

  let binanceData: Awaited<ReturnType<typeof getBinancePortfolioInr>> | undefined;
  try {
    binanceData = await getBinancePortfolioInr(userId);
  } catch {
    binanceData = undefined;
  }

  const zerodhaHoldings = await getZerodhaHoldings(userId);
  const zerodhaMFHoldings = await getZerodhaMFHoldings(userId);

  const binance_inr = binanceData?.total_inr ?? 0;
  const zerodha_inr = Array.isArray(zerodhaHoldings)
    ? zerodhaHoldings.reduce((sum, h) => sum + h.quantity * h.last_price, 0)
    : 0;
  const zerodha_mf_inr = Array.isArray(zerodhaMFHoldings)
    ? zerodhaMFHoldings.reduce((sum, h) => sum + h.quantity * h.last_price, 0)
    : 0;
  const result: PortfolioSummary = {
    binance_inr,
    zerodha_inr,
    zerodha_mf_inr,    
    total_inr: binance_inr + zerodha_inr + zerodha_mf_inr,
  };
  await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
  return result;
}

/**
 * Returns every individual asset (coin + stock) with its INR value,
 * sorted by value descending. Filters out assets worth less than ₹10.
 * Results are cached in Redis for 60 seconds when Zerodha equity loads successfully.
 */
export async function getPortfolioAssets(userId: string): Promise<{
  assets: AssetSlice[];
  total_inr: number;
}> {
  const cacheKey = `portfolio:assets:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as { assets: AssetSlice[]; total_inr: number };

  let binanceData: Awaited<ReturnType<typeof getBinancePortfolioInr>> | undefined;
  try {
    binanceData = await getBinancePortfolioInr(userId);
  } catch {
    binanceData = undefined;
  }

  const zerodhaHoldings = await getZerodhaHoldings(userId);
  const slices: AssetSlice[] = [];

  if (binanceData) {
    for (const a of binanceData.assets) {
      if (a.value_inr > 10) {
        slices.push({ name: a.symbol, value: a.value_inr, exchange: "Binance" });
      }
    }
  }

  if (Array.isArray(zerodhaHoldings)) {
    for (const h of zerodhaHoldings) {
      const value = h.quantity * h.last_price;
      if (value > 10) {
        slices.push({ name: h.tradingsymbol, value, exchange: "Zerodha" });
      }
    }
  }

  slices.sort((a, b) => b.value - a.value);
  const total_inr = slices.reduce((s, a) => s + a.value, 0);
  const result = { assets: slices, total_inr };

  if (Array.isArray(zerodhaHoldings)) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
  }
  return result;
}

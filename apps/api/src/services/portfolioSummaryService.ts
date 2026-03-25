import { getBinancePortfolioInr } from "./binanceInrService";
import { getZerodhaHoldings } from "./zerodhaService";

export interface PortfolioSummary {
  binance_inr: number;
  zerodha_inr: number;
  total_inr: number;
}

export interface AssetSlice {
  name: string;
  value: number;
  exchange: "Binance" | "Zerodha";
}

/**
 * Fetches Binance and Zerodha values in parallel and returns
 * a summary of each exchange's total INR value.
 */
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const [binanceData, zerodhaHoldings] = await Promise.allSettled([
    getBinancePortfolioInr(),
    getZerodhaHoldings(),
  ]);

  const binance_inr =
    binanceData.status === "fulfilled" ? binanceData.value.total_inr : 0;

  const zerodha_inr =
    zerodhaHoldings.status === "fulfilled"
      ? (zerodhaHoldings.value as Array<{ quantity: number; last_price: number }>).reduce(
          (sum, h) => sum + h.quantity * h.last_price,
          0
        )
      : 0;

  return {
    binance_inr,
    zerodha_inr,
    total_inr: binance_inr + zerodha_inr,
  };
}

/**
 * Returns every individual asset (coin + stock) with its INR value,
 * sorted by value descending. Filters out assets worth less than ₹10.
 */
export async function getPortfolioAssets(): Promise<{
  assets: AssetSlice[];
  total_inr: number;
}> {
  const [binanceData, zerodhaHoldings] = await Promise.allSettled([
    getBinancePortfolioInr(),
    getZerodhaHoldings(),
  ]);

  const slices: AssetSlice[] = [];

  if (binanceData.status === "fulfilled") {
    for (const a of binanceData.value.assets) {
      if (a.value_inr > 10) {
        slices.push({ name: a.symbol, value: a.value_inr, exchange: "Binance" });
      }
    }
  }

  if (zerodhaHoldings.status === "fulfilled") {
    for (const h of zerodhaHoldings.value as Array<{
      tradingsymbol: string;
      quantity: number;
      last_price: number;
    }>) {
      const value = h.quantity * h.last_price;
      if (value > 10) {
        slices.push({ name: h.tradingsymbol, value, exchange: "Zerodha" });
      }
    }
  }

  slices.sort((a, b) => b.value - a.value);
  const total_inr = slices.reduce((s, a) => s + a.value, 0);
  return { assets: slices, total_inr };
}

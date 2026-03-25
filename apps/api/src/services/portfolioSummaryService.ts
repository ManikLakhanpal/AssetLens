import { getBinancePortfolioInr } from "./binanceInrService";
import { getZerodhaHoldings } from "./zerodhaService";

export interface PortfolioSummary {
  binance_inr: number;
  zerodha_inr: number;
  total_inr: number;
}

/**
 * Fetches Binance and Zerodha values in parallel and returns
 * a summary of each exchange's total INR value.
 *
 * Zerodha holdings already come with last_price in INR.
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

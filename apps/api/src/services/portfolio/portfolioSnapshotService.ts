import { getPortfolioSummary, getPortfolioAssets } from "./portfolioSummaryService";
import {
  getZerodhaHoldings,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
} from "../zerodha/zerodhaService";
import { getBinancePortfolioInr } from "../binance/binanceInrService";

export async function collectPortfolioSnapshot() {
  const [
    portfolioSummaryRes,
    portfolioAssetsRes,
    zerodhaHoldingsRes,
    mfHoldingsRes,
    mfSipsRes,
    binancePortfolioRes,
  ] = await Promise.allSettled([
    getPortfolioSummary(),
    getPortfolioAssets(),
    getZerodhaHoldings(),
    getZerodhaMFHoldings(),
    getZerodhaMFSIPs(),
    getBinancePortfolioInr(),
  ]);

  return {
    portfolioSummary:
      portfolioSummaryRes.status === "fulfilled" ? portfolioSummaryRes.value : undefined,
    portfolioAssets:
      portfolioAssetsRes.status === "fulfilled" ? portfolioAssetsRes.value : undefined,

    zerodhaHoldings:
      zerodhaHoldingsRes.status === "fulfilled" ? zerodhaHoldingsRes.value : undefined,
    mfHoldings: mfHoldingsRes.status === "fulfilled" ? mfHoldingsRes.value : undefined,
    mfSips: mfSipsRes.status === "fulfilled" ? mfSipsRes.value : undefined,

    binancePortfolio:
      binancePortfolioRes.status === "fulfilled" ? binancePortfolioRes.value : undefined,
  };
}


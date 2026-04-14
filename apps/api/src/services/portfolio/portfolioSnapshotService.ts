import { getPortfolioSummary, getPortfolioAssets } from "./portfolioSummaryService.js";
import {
  getZerodhaProfile,
  getZerodhaHoldings,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
} from "../zerodha/zerodhaService.js";
import { getBinancePortfolioInr } from "../binance/binanceInrService.js";

async function tryAwait<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function collectPortfolioSnapshot(userId: string) {
  const portfolioSummary = await tryAwait(() => getPortfolioSummary(userId));
  const portfolioAssets = await tryAwait(() => getPortfolioAssets(userId));
  const zerodhaProfile = await getZerodhaProfile(userId);
  const zerodhaHoldings = await getZerodhaHoldings(userId);
  const mfHoldings = await getZerodhaMFHoldings(userId);
  const mfSips = await getZerodhaMFSIPs(userId);
  const binancePortfolio = await tryAwait(() => getBinancePortfolioInr(userId));

  return {
    portfolioSummary,
    portfolioAssets,
    zerodhaProfile,
    zerodhaHoldings,
    mfHoldings,
    mfSips,
    binancePortfolio,
  };
}

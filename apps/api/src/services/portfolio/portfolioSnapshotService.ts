import { getPortfolioSummary, getPortfolioAssets } from "./portfolioSummaryService";
import {
  getZerodhaProfile,
  getZerodhaHoldings,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
} from "../zerodha/zerodhaService";
import { getBinancePortfolioInr } from "../binance/binanceInrService";

async function tryAwait<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function collectPortfolioSnapshot() {
  const portfolioSummary = await tryAwait(() => getPortfolioSummary());
  const portfolioAssets = await tryAwait(() => getPortfolioAssets());
  const zerodhaProfile = await getZerodhaProfile();
  const zerodhaHoldings = await getZerodhaHoldings();
  const mfHoldings = await getZerodhaMFHoldings();
  const mfSips = await getZerodhaMFSIPs();
  const binancePortfolio = await tryAwait(() => getBinancePortfolioInr());

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

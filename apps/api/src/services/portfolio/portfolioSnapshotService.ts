import { getPortfolioSummary, getPortfolioAssets } from "./portfolioSummaryService.js";
import {
  getZerodhaProfile,
  getZerodhaHoldings,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
} from "../zerodha/zerodhaService.js";
import { getBinancePortfolioInr } from "../binance/binanceInrService.js";

export async function collectPortfolioSnapshot(userId: string) {
  const portfolioSummary = await getPortfolioSummary(userId).catch(() => undefined);
  const portfolioAssets = await getPortfolioAssets(userId).catch(() => undefined);
  const zerodhaProfile = await getZerodhaProfile(userId);
  const zerodhaHoldings = await getZerodhaHoldings(userId);
  const mfHoldings = await getZerodhaMFHoldings(userId);
  const mfSips = await getZerodhaMFSIPs(userId);
  const binancePortfolio = await getBinancePortfolioInr(userId).catch(() => undefined);

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

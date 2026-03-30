import { getPortfolioSummary, getPortfolioAssets } from "./portfolioSummaryService";
import {
  getZerodhaHoldings,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
} from "./zerodhaService";
import { getBinancePortfolioInr } from "./binanceInrService";
import { fundingWalletBalance, fundingWalletInfo } from "./accountService";

export async function collectPortfolioSnapshot() {
  const [
    portfolioSummaryRes,
    portfolioAssetsRes,
    zerodhaHoldingsRes,
    mfHoldingsRes,
    mfSipsRes,
    binancePortfolioRes,
    binanceFundingWalletRes,
    binanceAccountInfoRes,
  ] = await Promise.allSettled([
    getPortfolioSummary(),
    getPortfolioAssets(),
    getZerodhaHoldings(),
    getZerodhaMFHoldings(),
    getZerodhaMFSIPs(),
    getBinancePortfolioInr(),
    fundingWalletBalance(),
    fundingWalletInfo(),
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
    binanceFundingWallet:
      binanceFundingWalletRes.status === "fulfilled"
        ? binanceFundingWalletRes.value
        : undefined,
    binanceAccountInfo:
      binanceAccountInfoRes.status === "fulfilled" ? binanceAccountInfoRes.value : undefined,
  };
}


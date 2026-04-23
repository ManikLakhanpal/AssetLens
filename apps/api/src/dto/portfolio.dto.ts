import type { BinancePortfolioInr } from "./binance.dto";

export interface PortfolioSummary {
  binance_inr: number;
  zerodha_inr: number;
  zerodha_mf_inr: number;
  total_inr: number;
}

export interface AssetSlice {
  name: string;
  value: number;
  exchange: "Binance" | "Zerodha";
}

/** Snapshot shape produced by collectPortfolioSnapshot() */
export type PortfolioSnapshotInput = {
  portfolioSummary?: PortfolioSummary;
  portfolioAssets?: { assets: AssetSlice[]; total_inr: number };
  zerodhaProfile: unknown;
  zerodhaHoldings: unknown;
  mfHoldings: unknown;
  mfSips: unknown;
  binancePortfolio?: BinancePortfolioInr;
};

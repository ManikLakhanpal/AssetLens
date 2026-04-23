import type { Request, Response } from "express";
import { getBinancePortfolioInr } from "../services/binance/binanceInrService.js";
import { getPortfolioSummary, getPortfolioAssets } from "../services/portfolio/portfolioSummaryService.js";
import { getZerodhaMFHoldings } from "../services/zerodha/zerodhaService.js";

export async function fetchBinanceInrValue(req: Request, res: Response) {
  try {
    const data = await getBinancePortfolioInr(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/** Combined payload for portfolio pie chart + LangChain; partial fields on individual service failures. */
export async function fetchPortfolioPieData(req: Request, res: Response) {
  const userId = req.userId;
  let summary = null;
  let assets = null;

  try {
    summary = await getPortfolioSummary(userId);
  } catch {
    summary = null;
  }

  try {
    assets = await getPortfolioAssets(userId);
  } catch {
    assets = null;
  }

  const mfHoldings = await getZerodhaMFHoldings(userId);

  res.json({ summary, assets, mfHoldings });
}

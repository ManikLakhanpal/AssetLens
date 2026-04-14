import type { Request, Response } from "express";
import { getBinancePortfolioInr } from "../services/binance/binanceInrService.js";
import { getPortfolioSummary, getPortfolioAssets } from "../services/portfolio/portfolioSummaryService.js";

export async function fetchBinanceInrValue(_req: Request, res: Response) {
  try {
    const data = await getBinancePortfolioInr();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPortfolioSummary(req: Request, res: Response) {
  try {
    const data = await getPortfolioSummary(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPortfolioAssets(req: Request, res: Response) {
  try {
    const data = await getPortfolioAssets(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

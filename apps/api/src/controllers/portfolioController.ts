import type { Request, Response } from "express";
import { getBinancePortfolioInr } from "../services/binanceInrService";
import { getPortfolioSummary, getPortfolioAssets } from "../services/portfolioSummaryService";

export async function fetchBinanceInrValue(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getBinancePortfolioInr();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPortfolioSummary(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getPortfolioSummary();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPortfolioAssets(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getPortfolioAssets();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

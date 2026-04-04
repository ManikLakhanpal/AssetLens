import type { Request, Response } from "express";
import { 
  fundingWalletBalance,
  spotAccountInfo
} from "../services/binance/accountService";

export async function fetchFundingWalletBalance(_req: Request, res: Response) {
  try {
    const data = await fundingWalletBalance();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchSpotAccountInfo(_req: Request, res: Response) {
  try {
    const data = await spotAccountInfo();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

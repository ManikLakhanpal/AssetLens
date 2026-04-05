import type { Request, Response } from "express";
import { 
  fundingWalletBalance,
  spotAccountInfo,
  convertAsset,
  permissions
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

export async function convertAssetHandler(req: Request, res: Response): Promise<void> {
  try {
    const { symbol, side, amount } = req.body;

    if (!symbol || !side || amount === undefined) {
      res.status(400).json({ error: "Missing required parameters: symbol, side, amount" });
      return;
    }

    const data = await convertAsset(symbol, side, Number(amount));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPermissions(_req: Request, res: Response) {
  try {
    const data = await permissions();
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

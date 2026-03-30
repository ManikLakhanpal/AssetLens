import type { Request, Response } from "express";

import { 
  fundingWalletBalance,
  fundingWalletInfo
} from "../services/accountService";

export async function fetchFundingWalletBalance(_req: Request, res: Response) {
  try {
    const data = await fundingWalletBalance();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchAccountInformation(_req: Request, res: Response) {
  try {
    const data = await fundingWalletInfo();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

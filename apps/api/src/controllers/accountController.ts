import type { Request, Response } from "express";
import {
  fundingWalletBalance,
  spotAccountInfo,
  convertAsset,
  permissions,
  transferAsset,
} from "../services/binance/accountService.js";

export async function fetchFundingWalletBalance(req: Request, res: Response) {
  try {
    const data = await fundingWalletBalance(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function convertAssetHandler(req: Request, res: Response) {
  try {
    const { symbol, side, amount } = req.body;

    if (!symbol || !side || amount === undefined) {
      res.status(400).json({ error: "Missing required parameters: symbol, side, amount" });
      return;
    }

    const data = await convertAsset(req.userId, symbol, side, Number(amount));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchPermissions(req: Request, res: Response) {
  try {
    const data = await permissions(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchSpotAccountInfo(req: Request, res: Response) {
  try {
    const data = await spotAccountInfo(req.userId);
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function transferAssetHandler(req: Request, res: Response) {
  try {
    const { type, asset, amount } = req.body;

    if (!type || !asset || amount === undefined) {
      res.status(400).json({ error: "Missing required parameters: type, asset, amount" });
      return;
    }

    const data = await transferAsset(req.userId, type, asset, Number(amount));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

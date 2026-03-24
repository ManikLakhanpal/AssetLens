import type { Request, Response } from "express";

import { getAccountInfo } from "../services/accountService";

export async function fetchAccountData(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getAccountInfo();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

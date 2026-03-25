import type { Request, Response } from "express";
import { 
  getZerodhaProfile, 
  getZerodhaHoldings, 
  generateAccessToken 
} from "../services/zerodhaService";

export async function fetchZerodhaProfile(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getZerodhaProfile();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchZerodhaHoldings(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getZerodhaHoldings();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function generateZerodhaToken(req: Request, res: Response): Promise<void> {
  try {
    const { request_token } = req.body as { request_token?: string };
    console.log("Received request_token:", request_token);

    if (!request_token) {
      res.status(400).json({ error: "request_token is required" });
      return;
    }
    
    const data = await generateAccessToken(request_token);
    console.log("Generated access token:", data);

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

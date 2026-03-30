import type { Request, Response } from "express";
import { 
  getZerodhaProfile, 
  getZerodhaHoldings, 
  generateAccessToken,
  type ZerodhaServiceError,
  getZerodhaMFHoldings,
} from "../services/zerodhaService";

function isZerodhaServiceError(data: unknown): data is ZerodhaServiceError {
  return Boolean(
    data &&
      typeof data === "object" &&
      "success" in data &&
      (data as { success?: boolean }).success === false &&
      "message" in data
  );
}

function sendZerodhaResponse(res: Response, data: unknown) {
  if (isZerodhaServiceError(data)) {
    const statusCode = data.code === "AUTH_REQUIRED" ? 401 : 502;
    res.status(statusCode).json(data);
    return;
  }

  res.json(data);
}

export async function fetchZerodhaProfile(_req: Request, res: Response) {
  try {
    const data = await getZerodhaProfile();
    sendZerodhaResponse(res, data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchZerodhaHoldings(_req: Request, res: Response) {
  try {
    const data = await getZerodhaHoldings();
    sendZerodhaResponse(res, data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function fetchZerodhaMFHoldings(_req: Request, res: Response) {
  try {
    const data = await getZerodhaMFHoldings();
    sendZerodhaResponse(res, data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export async function generateZerodhaToken(req: Request, res: Response) {
  try {
    const { request_token } = req.body as { request_token?: string };

    if (!request_token) {
      res.status(400).json({ error: "request_token is required" });
      return;
    }
    
    const data = await generateAccessToken(request_token);
    sendZerodhaResponse(res, data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

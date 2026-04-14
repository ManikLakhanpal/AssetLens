import type { Request, Response } from "express";
import type { ZerodhaServiceError, PlaceZerodhaOrderInput } from "../dto/zerodha.dto";
import {
  getZerodhaProfile,
  getZerodhaHoldings,
  generateAccessToken,
  getZerodhaMFHoldings,
  getZerodhaMFSIPs,
  placeZerodhaOrder,
} from "../services/zerodha/zerodhaService";

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

export async function fetchZerodhaMFSIPs(_req: Request, res: Response) {
  try {
    const data = await getZerodhaMFSIPs();
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

const ALLOWED_VARIETIES = new Set(["amo", "regular", "co", "auction", "iceberg"]);
const ALLOWED_EXCHANGES = new Set(["NSE", "BSE"]);
const ALLOWED_ORDER_TYPES = new Set(["BUY", "SELL"]);

function parsePlaceOrderInput(body: unknown): PlaceZerodhaOrderInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const {
    variety,
    tradingsymbol,
    exchange,
    qty,
    orderType,
  } = body as {
    variety?: unknown;
    tradingsymbol?: unknown;
    exchange?: unknown;
    qty?: unknown;
    orderType?: unknown;
  };

  const parsedQty = typeof qty === "number" ? qty : Number(qty);

  if (
    typeof variety !== "string" ||
    !ALLOWED_VARIETIES.has(variety) ||
    typeof tradingsymbol !== "string" ||
    !tradingsymbol.trim() ||
    typeof exchange !== "string" ||
    !ALLOWED_EXCHANGES.has(exchange) ||
    !Number.isFinite(parsedQty) ||
    parsedQty <= 0 ||
    typeof orderType !== "string" ||
    !ALLOWED_ORDER_TYPES.has(orderType)
  ) {
    return null;
  }

  return {
    variety: variety as PlaceZerodhaOrderInput["variety"],
    tradingsymbol: tradingsymbol.trim(),
    exchange: exchange as PlaceZerodhaOrderInput["exchange"],
    qty: parsedQty,
    orderType: orderType as PlaceZerodhaOrderInput["orderType"],
  };
}

export async function createZerodhaOrder(req: Request, res: Response) {
  try {
    const orderInput = parsePlaceOrderInput(req.body);

    if (!orderInput) {
      res.status(400).json({
        error:
          "Invalid payload. Required: variety, tradingsymbol, exchange, qty, orderType.",
      });
      return;
    }

    const data = await placeZerodhaOrder(orderInput);
    sendZerodhaResponse(res, data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

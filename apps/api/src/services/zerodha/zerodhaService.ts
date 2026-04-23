import { createKiteClient, createKiteConnectForSessionExchange } from "./kite.js";
import prisma from "../../db/prisma.js";
import { decrypt } from "../auth/cryptoService.js";
import type {
  ZerodhaServiceError,
  ZerodhaOrderVariety,
  ZerodhaOrderExchange,
  ZerodhaOrderType,
  PlaceZerodhaOrderInput,
} from "../../dto/zerodha.dto.js";

export type {
  ZerodhaServiceError,
  ZerodhaOrderVariety,
  ZerodhaOrderExchange,
  ZerodhaOrderType,
  PlaceZerodhaOrderInput,
};

/**
 * Reads the Zerodha API key from DB for the given user and returns the Kite login URL.
 * Used by the /zerodha/login-url endpoint so the frontend can show a login button
 * without relying on the ZERODHA_API_KEY env var (which is no longer used).
 */
export async function fetchZerodhaKiteLoginUrl(userId: string) {
  const creds = await prisma.zerodhaCredentials.findUnique({ where: { userId } });
  if (!creds) return null;
  const apiKey = decrypt(creds.apiKey);
  return `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

function isAuthError(message: string) {
  const m = message.toLowerCase();

  if (m.includes("incorrect") && (m.includes("api_key") || m.includes("access_token"))) {
    return true;
  }

  return [
    "token is invalid",
    "token has expired",
    "access token",
    "access_token",
    "invalid `api_key`",
    "invalid api key",
    "tokenexception",
    "permission denied",
    "unauthorized",
    "session",
    "login",
  ].some((fragment) => m.includes(fragment));
}

function buildZerodhaServiceError(error: unknown, fallbackMessage: string): ZerodhaServiceError {
  const raw = normalizeErrorMessage(error);
  const message = raw || fallbackMessage;
  const code = isAuthError(message) ? "AUTH_REQUIRED" : "ZERODHA_ERROR";

  return {
    success: false,
    code,
    message,
  };
}

// * Generate access token from request token
export async function generateAccessToken(requestToken: string, userId: string) {
  try {
    const zerodha = await prisma.zerodhaCredentials.findUnique({ where: { userId } });
    if (!zerodha) throw new Error("Zerodha credentials not found");

    const apiSecret = decrypt(zerodha.apiSecret);
    // Must not use createKiteClient here: it requires an existing access token,
    // but this flow is how we obtain the first token after Kite redirect.
    const kiteClient = await createKiteConnectForSessionExchange(userId);

    const session = await kiteClient.generateSession(requestToken, apiSecret);
    return {
      access_token: session.access_token,
      user_id: session.user_id,
      login_time: session.login_time,
    };
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to generate Zerodha access token");
    console.error("generateAccessToken error:", serviceError.message);
    return serviceError;
  }
}

// * Zerodha User Profile
export async function getZerodhaProfile(userId: string) {
  try {
    const kiteClient = await createKiteClient(userId);
    const profile = await kiteClient.getProfile();
    return profile;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to fetch Zerodha profile");
    console.error("getZerodhaProfile error:", serviceError.message);
    return serviceError;
  }
}

// * Zerodha Stock Holdings
export async function getZerodhaHoldings(userId: string) {
  try {
    const kiteClient = await createKiteClient(userId);
    const holdings = await kiteClient.getHoldings();
    return holdings;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to fetch Zerodha holdings");
    console.error("getZerodhaHoldings error:", serviceError.message);
    return serviceError;
  }
}

// * Zerodha Mutual Fund Holdings
export async function getZerodhaMFHoldings(userId: string) {
  try {
    const kiteClient = await createKiteClient(userId);
    const holdings = await kiteClient.getMFHoldings();
    return holdings;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to fetch Zerodha MF holdings");
    console.error("getZerodhaMFHoldings error:", serviceError.message);
    return serviceError;
  }
}

// * Zerodha Mutual Fund SIPs
export async function getZerodhaMFSIPs(userId: string) {
  try {
    const kiteClient = await createKiteClient(userId);
    const sips = await kiteClient.getMFSIPS();
    return sips;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to fetch Zerodha MF SIPs");
    console.error("getZerodhaMFSIPs error:", serviceError.message);
    return serviceError;
  }
}

// * Place a Zerodha Equity Market Order
export async function placeZerodhaOrder(order: PlaceZerodhaOrderInput, userId: string) {
  try {
    const kiteClient = await createKiteClient(userId);
    const result = await kiteClient.placeOrder(order.variety, {
      exchange: order.exchange,
      tradingsymbol: order.tradingsymbol,
      transaction_type: order.orderType,
      quantity: Number(order.qty),
      product: "CNC",
      order_type: "MARKET",
      market_protection: 2,
    } as any);
    return result;
  } catch (error) {
    const serviceError = buildZerodhaServiceError(error, "Failed to place Zerodha order");
    console.error("placeZerodhaOrder error:", serviceError.message);
    return serviceError;
  }
}

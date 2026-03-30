import type { AxiosError } from "axios";

export type ZerodhaApiError = {
  success: false;
  code?: "AUTH_REQUIRED" | "ZERODHA_ERROR";
  message: string;
  login_url?: string;
};

export interface ZerodhaProfileResponse {
  user_id: string;
  user_name: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
}

export interface ZerodhaHolding {
  tradingsymbol: string;
  exchange: string;
  isin: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function isZerodhaApiError(value: unknown): value is ZerodhaApiError {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.message === "string"
  );
}

export function isZerodhaProfileResponse(
  value: unknown
): value is ZerodhaProfileResponse {
  return (
    isRecord(value) &&
    typeof value.user_id === "string" &&
    typeof value.user_name === "string" &&
    typeof value.email === "string" &&
    typeof value.user_type === "string" &&
    typeof value.broker === "string" &&
    Array.isArray(value.exchanges) &&
    Array.isArray(value.products) &&
    Array.isArray(value.order_types)
  );
}

export function isZerodhaHolding(value: unknown): value is ZerodhaHolding {
  return (
    isRecord(value) &&
    typeof value.tradingsymbol === "string" &&
    typeof value.exchange === "string" &&
    typeof value.isin === "string" &&
    typeof value.quantity === "number" &&
    typeof value.average_price === "number" &&
    typeof value.last_price === "number" &&
    typeof value.pnl === "number" &&
    typeof value.day_change === "number" &&
    typeof value.day_change_percentage === "number"
  );
}

export function extractZerodhaApiError(
  error: unknown
): ZerodhaApiError | null {
  const responseData = (error as AxiosError<unknown>)?.response?.data;
  return isZerodhaApiError(responseData) ? responseData : null;
}

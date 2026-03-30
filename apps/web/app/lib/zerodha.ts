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

export interface ZerodhaMFHolding {
  tradingsymbol: string;
  fund: string;
  folio: string;
  last_price: number;
  last_price_date?: string;
  quantity: number;
  pnl: number;
  xirr: number;
  average_price: number;
  discrepancy: boolean;
  pledged_quantity: number;
  las_quantity: number;
}

export interface ZerodhaMFSip {
  status: "ACTIVE" | "PAUSED" | string;
  instalment_day: number;
  tradingsymbol: string;
  transaction_type: string;
  next_instalment: string;
  last_instalment: string;
  created: string;
  dividend_type: string;
  sip_id: string;
  fund: string;
  frequency: string;
  instalments: number;
  pending_instalments: number;
  completed_instalments: number;
  instalment_amount: number;
  tag: string;
  weekday: string | null;
  trigger_price: number;
  sip_type: string;
  sip_reg_num: string | null;
  step_up?: Record<string, number>;
  fund_source: string;
  mandate_type: string;
  mandate_id: string | null;
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

export function isZerodhaMFHolding(value: unknown): value is ZerodhaMFHolding {
  return (
    isRecord(value) &&
    typeof value.tradingsymbol === "string" &&
    typeof value.fund === "string" &&
    typeof value.folio === "string" &&
    typeof value.last_price === "number" &&
    typeof value.quantity === "number" &&
    typeof value.pnl === "number" &&
    typeof value.xirr === "number" &&
    typeof value.average_price === "number" &&
    typeof value.discrepancy === "boolean" &&
    typeof value.pledged_quantity === "number" &&
    typeof value.las_quantity === "number"
  );
}

export function isZerodhaMFSip(value: unknown): value is ZerodhaMFSip {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    typeof value.instalment_day === "number" &&
    typeof value.tradingsymbol === "string" &&
    typeof value.transaction_type === "string" &&
    typeof value.next_instalment === "string" &&
    typeof value.last_instalment === "string" &&
    typeof value.created === "string" &&
    typeof value.dividend_type === "string" &&
    typeof value.sip_id === "string" &&
    typeof value.fund === "string" &&
    typeof value.frequency === "string" &&
    typeof value.instalments === "number" &&
    typeof value.pending_instalments === "number" &&
    typeof value.completed_instalments === "number" &&
    typeof value.instalment_amount === "number" &&
    typeof value.tag === "string" &&
    (typeof value.weekday === "string" || value.weekday === null) &&
    typeof value.trigger_price === "number" &&
    typeof value.sip_type === "string" &&
    (typeof value.sip_reg_num === "string" || value.sip_reg_num === null) &&
    typeof value.fund_source === "string" &&
    typeof value.mandate_type === "string" &&
    (typeof value.mandate_id === "string" || value.mandate_id === null)
  );
}

export function extractZerodhaApiError(
  error: unknown
): ZerodhaApiError | null {
  const responseData = (error as AxiosError<unknown>)?.response?.data;
  return isZerodhaApiError(responseData) ? responseData : null;
}

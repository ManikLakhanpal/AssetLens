export type ZerodhaServiceError = {
  success: false;
  code: "AUTH_REQUIRED" | "ZERODHA_ERROR";
  message: string;
  login_url?: string;
};

export type ZerodhaOrderVariety = "amo" | "regular" | "co" | "auction" | "iceberg";
export type ZerodhaOrderExchange = "NSE" | "BSE";
export type ZerodhaOrderType = "BUY" | "SELL";

export type PlaceZerodhaOrderInput = {
  variety: ZerodhaOrderVariety;
  tradingsymbol: string;
  exchange: ZerodhaOrderExchange;
  qty: number;
  orderType: ZerodhaOrderType;
};

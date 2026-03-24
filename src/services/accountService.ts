import axios from "axios";
import crypto from "crypto";

import AccountModel from "../models/accountModel";

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
const BINANCE_FUNDING_ASSET_URL =
  "https://api.binance.com/sapi/v1/asset/get-funding-asset";

export async function getAccountInfo(): Promise<unknown> {
  if (!BINANCE_API_KEY || !BINANCE_API_SECRET) {
    throw new Error("Missing BINANCE_API_KEY or BINANCE_API_SECRET in environment variables");
  }

  const timestamp = Date.now();
  const queryString = AccountModel.buildFundingAssetRequestParams(timestamp);
  const signature = crypto
    .createHmac("sha256", BINANCE_API_SECRET)
    .update(queryString)
    .digest("hex");

  const url = `${BINANCE_FUNDING_ASSET_URL}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.post(url, {}, {
      headers: {
        "X-MBX-APIKEY": BINANCE_API_KEY,
      },
    });

    return AccountModel.toApiResponse(response.data);
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { msg?: string } };
      message?: string;
    };
    console.error(err.response?.data || err.message);
    throw new Error(err.response?.data?.msg || err.message || "Request failed");
  }
}

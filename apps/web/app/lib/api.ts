import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:4000";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return DEFAULT_API_BASE;
  return raw.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${p}`;
}

export const routes = {
  zerodha: {
    profile: "/zerodha/profile",
    holdings: "/zerodha/holdings",
    mfHoldings: "/zerodha/mf-holdings",
    mfSips: "/zerodha/mf-sips",
    generateToken: "/zerodha/generate-token",
  },
  portfolio: {
    summary: "/portfolio/summary",
    assets: "/portfolio/assets",
    binanceInrValue: "/portfolio/binance/inr-value",
  },
  binance: {
    accountInfo: "/binance/account-info",
    getData: "/binance/get-data",
  },
  ai: {
    portfolioSummary: "/ai/portfolio-summary",
    chat: "/ai/chat",
  },
} as const;

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

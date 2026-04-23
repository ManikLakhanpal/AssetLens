import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:4000";

export const TOKEN_KEY = "assetlens_token";

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
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    credentials: "/auth/credentials",
  },
  zerodha: {
    loginUrl: "/zerodha/login-url",
    profile: "/zerodha/profile",
    holdings: "/zerodha/stock-holdings-data",
    mfHoldings: "/zerodha/mf-holdings-data",
    mfSips: "/zerodha/mf-sips",
    generateToken: "/zerodha/generate-token",
  },
  portfolio: {
    pieData: "/portfolio/data",
    binanceInrValue: "/portfolio/binance/inr-value",
  },
  binance: {
    accountInfo: "/binance/spot-account-data",
    getData: "/binance/funding-account-data",
  },
  ai: {
    portfolioSummary: "/ai/portfolio-summary",
    chat: "/ai/chat",
  },
} as const;

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, only log out if it is a JWT rejection (not a business-level error like Zerodha AUTH_REQUIRED)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error?.response?.status === 401;
    const isBusinessError = error?.response?.data?.success === false;
    if (typeof window !== "undefined" && is401 && !isBusinessError) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    throw error;
  }
);

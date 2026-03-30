import axios from "axios";

// Map of Binance trading symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
  USDC: "usd-coin",
  XRP: "ripple",
  SOL: "solana",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  SHIB: "shiba-inu",
  MATIC: "matic-network",
  LTC: "litecoin",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  XLM: "stellar",
  BCH: "bitcoin-cash",
  FIL: "filecoin",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  PEPE: "pepe",
  WIF: "dogwifcoin",
  SUI: "sui",
  INJ: "injective-protocol",
  TIA: "celestia",
  SEI: "sei-network",
  FTM: "fantom",
  ALGO: "algorand",
  SAND: "the-sandbox",
  MANA: "decentraland",
  AAVE: "aave",
  SNX: "havven",
  CRV: "curve-dao-token",
  MKR: "maker",
  COMP: "compound-governance-token",
  GRT: "the-graph",
  RUNE: "thorchain",
  KSM: "kusama",
  EGLD: "elrond-erd-2",
  FLOW: "flow",
  ICP: "internet-computer",
  VET: "vechain",
  HBAR: "hedera-hashgraph",
  EOS: "eos",
  TRX: "tron",
  ZIL: "zilliqa",
  ONE: "harmony",
  ROSE: "oasis-network",
  JASMY: "jasmycoin",
  LUNC: "terra-luna",
  LUNA: "terra-luna-2",
  BUSD: "binance-usd",
  DAI: "dai",
  TUSD: "true-usd",
  FDUSD: "first-digital-usd",
  LDOIDO: "lido-dao",
  LDO: "lido-dao",
};

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

/**
 * Fetch INR prices for a list of symbols.
 * Returns a map of symbol → INR price (0 if not found).
 */
export async function getCryptoPricesInr(
  symbols: string[]
) {
  const ids: string[] = [];
  const symbolToId: Record<string, string> = {};

  for (const sym of symbols) {
    const id = SYMBOL_TO_COINGECKO_ID[sym.toUpperCase()];
    if (id) {
      ids.push(id);
      symbolToId[sym.toUpperCase()] = id;
    }
  }

  if (ids.length === 0) return {};

  const uniqueIds = [...new Set(ids)].join(",");
  const response = await axios.get(`${COINGECKO_BASE}/simple/price`, {
    params: { ids: uniqueIds, vs_currencies: "inr" },
    timeout: 10000,
  });

  const priceData = response.data as Record<string, { inr: number }>;

  // Invert: symbol → price
  const result: Record<string, number> = {};
  for (const [sym, id] of Object.entries(symbolToId)) {
    result[sym] = priceData[id]?.inr ?? 0;
  }
  return result;
}

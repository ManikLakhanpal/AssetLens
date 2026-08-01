import type { PortfolioSnapshotInput } from "../../dto/portfolio.dto.js";

export type AssetDelta = {
  name: string;
  exchange: string;
  previousValue: number;
  currentValue: number;
  deltaInr: number;
  deltaPercent: number | null;
};

export type PortfolioDelta = {
  previousTotalInr: number | null;
  currentTotalInr: number;
  totalDeltaInr: number | null;
  totalDeltaPercent: number | null;
  assetDeltas: AssetDelta[];
  newAssets: string[];
  removedAssets: string[];
  previousSnapshotAt: string | null;
};

type MfHolding = { tradingsymbol?: string; fund?: string; quantity: number; last_price: number };

function isZerodhaError(v: unknown): boolean {
  return (
    typeof v === "object" &&
    v !== null &&
    "success" in v &&
    (v as { success: unknown }).success === false
  );
}

function assetKey(name: string, exchange: string): string {
  return `${exchange}:${name}`;
}

function extractAssetValues(snapshot: PortfolioSnapshotInput): Map<string, { name: string; exchange: string; value: number }> {
  const map = new Map<string, { name: string; exchange: string; value: number }>();

  if (snapshot.portfolioAssets?.assets) {
    for (const a of snapshot.portfolioAssets.assets) {
      map.set(assetKey(a.name, a.exchange), {
        name: a.name,
        exchange: a.exchange,
        value: a.value,
      });
    }
  }

  if (!isZerodhaError(snapshot.mfHoldings) && Array.isArray(snapshot.mfHoldings)) {
    for (const mf of snapshot.mfHoldings as MfHolding[]) {
      const name = mf.tradingsymbol ?? mf.fund ?? "MF";
      const value = mf.quantity * mf.last_price;
      if (value > 0) {
        map.set(assetKey(name, "Zerodha MF"), { name, exchange: "Zerodha MF", value });
      }
    }
  }

  return map;
}

export function computeTotalInr(snapshot: PortfolioSnapshotInput): number {
  if (snapshot.portfolioSummary) {
    return snapshot.portfolioSummary.total_inr;
  }

  let total = 0;
  if (snapshot.binancePortfolio?.total_inr) {
    total += snapshot.binancePortfolio.total_inr;
  }
  const assets = extractAssetValues(snapshot);
  for (const a of assets.values()) {
    total += a.value;
  }
  return total;
}

export function computePortfolioDelta(
  previous: PortfolioSnapshotInput | null,
  current: PortfolioSnapshotInput,
  previousSnapshotAt: Date | null
): PortfolioDelta {
  const currentTotalInr = computeTotalInr(current);
  const currentAssets = extractAssetValues(current);

  if (!previous) {
    return {
      previousTotalInr: null,
      currentTotalInr,
      totalDeltaInr: null,
      totalDeltaPercent: null,
      assetDeltas: [],
      newAssets: [...currentAssets.keys()],
      removedAssets: [],
      previousSnapshotAt: null,
    };
  }

  const previousTotalInr = computeTotalInr(previous);
  const previousAssets = extractAssetValues(previous);
  const assetDeltas: AssetDelta[] = [];
  const newAssets: string[] = [];
  const removedAssets: string[] = [];

  for (const [key, curr] of currentAssets) {
    const prev = previousAssets.get(key);
    if (!prev) {
      newAssets.push(key);
      continue;
    }
    const deltaInr = curr.value - prev.value;
    if (Math.abs(deltaInr) >= 0.01) {
      assetDeltas.push({
        name: curr.name,
        exchange: curr.exchange,
        previousValue: prev.value,
        currentValue: curr.value,
        deltaInr,
        deltaPercent: prev.value > 0 ? (deltaInr / prev.value) * 100 : null,
      });
    }
  }

  for (const key of previousAssets.keys()) {
    if (!currentAssets.has(key)) {
      removedAssets.push(key);
    }
  }

  assetDeltas.sort((a, b) => Math.abs(b.deltaInr) - Math.abs(a.deltaInr));

  const totalDeltaInr = currentTotalInr - previousTotalInr;
  const totalDeltaPercent =
    previousTotalInr > 0 ? (totalDeltaInr / previousTotalInr) * 100 : null;

  return {
    previousTotalInr,
    currentTotalInr,
    totalDeltaInr,
    totalDeltaPercent,
    assetDeltas: assetDeltas.slice(0, 15),
    newAssets,
    removedAssets,
    previousSnapshotAt: previousSnapshotAt?.toISOString() ?? null,
  };
}

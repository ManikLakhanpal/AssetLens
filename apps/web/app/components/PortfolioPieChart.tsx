"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { api, routes } from "../lib/api";
import { isZerodhaMFHolding, type ZerodhaMFHolding } from "../lib/zerodha";

// ── Types ──────────────────────────────────────────────────────────────────

interface PortfolioSummary {
  binance_inr: number;
  zerodha_inr: number;
  total_inr: number;
}

interface AssetSlice {
  name: string;
  value: number;
  exchange: "Binance" | "Zerodha";
}

interface AssetData {
  assets: AssetSlice[];
  total_inr: number;
}

type ViewMode = "exchange" | "asset";
type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

// ── Helpers ────────────────────────────────────────────────────────────────

const formatInr = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(2)}K`;
  return `₹${value.toFixed(2)}`;
};

// Deterministic colour palette (20 distinct colours)
const PALETTE = [
  "#14b8a6", "#f97316", "#6366f1", "#ec4899", "#eab308",
  "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#06b6d4",
  "#84cc16", "#f43f5e", "#8b5cf6", "#10b981", "#f59e0b",
  "#0ea5e9", "#d946ef", "#64748b", "#fb923c", "#4ade80",
];

const colorFor = (index: number) => PALETTE[index % PALETTE.length];

async function settle<T>(task: T) {
  try {
    return { status: "fulfilled", value: await task } as Settled<Awaited<T>>;
  } catch (reason: unknown) {
    return { status: "rejected", reason } as Settled<Awaited<T>>;
  }
}

async function settlePair<T1, T2>(first: T1, second: T2) {
  return [await settle(first), await settle(second)] as const;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, total }: { active?: boolean; payload?: any[]; total: number }) {
  if (!active || !payload?.length) return null;
  const { name, value, exchange } = payload[0].payload;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-lg text-sm space-y-0.5">
      <p className="font-semibold text-slate-800 dark:text-white">{name}</p>
      {exchange && (
        <p className="text-xs text-slate-400 dark:text-zinc-500">{exchange}</p>
      )}
      <p className="text-slate-600 dark:text-zinc-300 tabular-nums">{formatInr(value)}</p>
      <p className="text-slate-400 dark:text-zinc-500 text-xs">{pct}% of portfolio</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PortfolioPieChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("exchange");

  const [summaryData, setSummaryData] = useState<PortfolioSummary | null>(null);
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [mfValueInr, setMfValueInr] = useState<number>(0);
  const [mfAssetSlices, setMfAssetSlices] = useState<AssetSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [summaryRes, assetsRes, mfRes] = await Promise.all([
        settle(api.get(routes.portfolio.summary)),
        settle(api.get(routes.portfolio.assets)),
        settle(api.get(routes.zerodha.mfHoldings)),
      ]);

      if (summaryRes.status === "fulfilled") setSummaryData(summaryRes.value.data);
      if (assetsRes.status === "fulfilled") setAssetData(assetsRes.value.data);
      if (summaryRes.status === "rejected" && assetsRes.status === "rejected") {
        setErrorMsg("Failed to fetch portfolio data");
      }

      if (mfRes.status === "fulfilled" && Array.isArray(mfRes.value.data)) {
        const mfHoldings = mfRes.value.data.filter(isZerodhaMFHolding) as ZerodhaMFHolding[];
        const slices = mfHoldings
          .map((mf) => {
            const value = mf.quantity * mf.last_price;
            return {
              name: mf.fund,
              value,
              exchange: "Zerodha" as const,
            };
          })
          .filter((s) => s.value > 10);

        const total = slices.reduce((sum, s) => sum + s.value, 0);
        setMfAssetSlices(slices);
        setMfValueInr(total);
      } else {
        setMfAssetSlices([]);
        setMfValueInr(0);
      }

      setLoading(false);
    };

    load();
  }, []);

  // Build chart data based on view
  const exchangeChartData =
    summaryData && summaryData.total_inr + mfValueInr > 0
    ? [
        { name: "Binance", value: summaryData.binance_inr, exchange: "" },
        {
          name: "Zerodha",
          value: summaryData.zerodha_inr + mfValueInr,
          exchange: "",
        },
      ]
    : [];

  const assetChartData = [
    ...(assetData?.assets ?? []),
    ...mfAssetSlices,
  ];

  const chartData = viewMode === "exchange" ? exchangeChartData : assetChartData;
  const total = viewMode === "exchange"
    ? (summaryData?.total_inr ?? 0) + mfValueInr
    : (assetData?.total_inr ?? 0) + mfValueInr;

  // Legend items (top 10 shown in list)
  const legendItems = viewMode === "exchange"
    ? exchangeChartData.map((d, i) => ({ ...d, color: colorFor(i) }))
    : assetChartData.slice(0, 12).map((d, i) => ({ ...d, color: colorFor(i) }));

  return (
    <div className="flex flex-col gap-5 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Portfolio Split
          {total > 0 && (
            <span className="ml-1 text-slate-500 dark:text-zinc-400 font-normal text-base">
              · <span className="text-slate-800 dark:text-white font-semibold">{formatInr(total)}</span>
            </span>
          )}
        </h2>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50">
          {(["exchange", "asset"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                viewMode === mode
                  ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
              }`}
            >
              {mode === "exchange" ? "By Exchange" : "By Asset"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        <div className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</div>
      ) : chartData.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut */}
          <div className="w-full lg:w-56 h-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={0}
                  animationDuration={500}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colorFor(i)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + bars */}
          <div className="flex-1 flex flex-col gap-2.5 w-full min-w-0">
            {legendItems.map((item, i) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={`${item.name}-${i}`} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center min-w-0">
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 dark:text-zinc-300 text-sm font-medium truncate">
                        {item.name}
                      </span>
                      {viewMode === "asset" && (item as AssetSlice).exchange && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                          (item as AssetSlice).exchange === "Binance"
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }`}>
                          {(item as AssetSlice).exchange}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-800 dark:text-white font-semibold text-sm tabular-nums">
                        {formatInr(item.value)}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-600 text-xs ml-1.5">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
            {viewMode === "asset" && assetChartData.length > 12 && (
              <p className="text-xs text-slate-400 dark:text-zinc-600 pt-1">
                +{assetChartData.length - 12} more assets in chart
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-16">
          No portfolio data available.
        </div>
      )}
    </div>
  );
}

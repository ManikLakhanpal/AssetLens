"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PortfolioSummary {
  binance_inr: number;
  zerodha_inr: number;
  total_inr: number;
}

const formatInr = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(2)}K`;
  return `₹${value.toFixed(2)}`;
};

const COLORS = {
  binance: { fill: "#14b8a6", light: "#0d9488" },   // teal
  zerodha: { fill: "#f97316", light: "#ea6c00" },   // orange
};

export default function PortfolioPieChart() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:4000/portfolio/summary")
      .then((res) => setData(res.data))
      .catch((err) =>
        setErrorMsg(err?.response?.data?.error || "Failed to fetch portfolio summary")
      )
      .finally(() => setLoading(false));
  }, []);

  const chartData =
    data && data.total_inr > 0
      ? [
          { name: "Binance", value: data.binance_inr },
          { name: "Zerodha", value: data.zerodha_inr },
        ]
      : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const { name, value } = payload[0];
      const pct = data ? ((value / data.total_inr) * 100).toFixed(1) : "0";
      return (
        <div className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-white">{name}</p>
          <p className="text-slate-600 dark:text-zinc-300">{formatInr(value)}</p>
          <p className="text-slate-400 dark:text-zinc-500 text-xs">{pct}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Portfolio Split
        </h2>
        {data && (
          <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Total: <span className="text-slate-800 dark:text-white font-semibold">{formatInr(data.total_inr)}</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        <div className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</div>
      ) : data && data.total_inr > 0 ? (
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut chart */}
          <div className="w-full md:w-64 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? COLORS.binance.fill : COLORS.zerodha.fill}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + breakdown */}
          <div className="flex-1 flex flex-col gap-4 w-full">
            {/* Binance row */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-slate-600 dark:text-zinc-300 text-sm font-medium">Binance</span>
                </div>
                <span className="text-slate-800 dark:text-white font-semibold text-sm tabular-nums">
                  {formatInr(data.binance_inr)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-700"
                  style={{ width: `${(data.binance_inr / data.total_inr) * 100}%` }}
                />
              </div>
              <p className="text-slate-400 dark:text-zinc-600 text-xs text-right">
                {((data.binance_inr / data.total_inr) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Zerodha row */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-slate-600 dark:text-zinc-300 text-sm font-medium">Zerodha</span>
                </div>
                <span className="text-slate-800 dark:text-white font-semibold text-sm tabular-nums">
                  {formatInr(data.zerodha_inr)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{ width: `${(data.zerodha_inr / data.total_inr) * 100}%` }}
                />
              </div>
              <p className="text-slate-400 dark:text-zinc-600 text-xs text-right">
                {((data.zerodha_inr / data.total_inr) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-16">
          No portfolio data available.
        </div>
      )}
    </div>
  );
}

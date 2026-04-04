"use client";

import React, { useEffect, useState } from "react";
import { api, routes } from "../lib/api";

interface BinanceAssetInr {
  symbol: string;
  quantity: number;
  price_inr: number;
  value_inr: number;
}

interface BinancePortfolioInr {
  assets: BinanceAssetInr[];
  total_inr: number;
  funding: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
  spot: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
}

const formatInr = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(2)}K`;
  if (value > 0) return `₹${value.toFixed(2)}`;
  return "—";
};

export default function BinanceHoldings() {
  const [portfolio, setPortfolio] = useState<BinancePortfolioInr | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(routes.portfolio.binanceInrValue)
      .then((res) => setPortfolio(res.data))
      .catch((err) =>
        setErrorMsg(err?.response?.data?.error || "Failed to fetch from backend")
      )
      .finally(() => setLoading(false));
  }, []);

  const spotAssets = portfolio?.spot.assets ?? [];
  const fundingAssets = portfolio?.funding.assets ?? [];

  return (
    <div className="flex flex-col gap-6 p-6 col-span-2 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all hover:bg-white dark:hover:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700/50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Binance Holdings
        </h2>
        <span className="text-slate-400 dark:text-zinc-500 text-sm">
          {loading ? "Loading..." : `${spotAssets.length} Spot · ${fundingAssets.length} Funding`}
        </span>
      </div>

      {/* Total portfolio value */}
      {!loading && portfolio && (spotAssets.length > 0 || fundingAssets.length > 0) && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10">
          <span className="text-amber-700 dark:text-amber-400 text-sm font-medium">Total Balance</span>
          <span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
            {formatInr(portfolio.total_inr)}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        <div className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Spot Account */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800 dark:text-white">Spot Account</h3>
              {portfolio && spotAssets.length > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  {formatInr(portfolio.spot.total_inr)}
                </span>
              )}
            </div>
            
            {spotAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                      <th className="py-3 font-normal">Asset</th>
                      <th className="py-3 font-normal text-right">Qty</th>
                      <th className="py-3 font-normal text-right">Price (INR)</th>
                      <th className="py-3 font-normal text-right">Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spotAssets.map((asset) => (
                      <tr key={`spot-${asset.symbol}`} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-4 font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-500 dark:text-zinc-400 font-bold group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                            {asset.symbol.slice(0, 3)}
                          </div>
                          <span className="text-slate-700 dark:text-zinc-200">{asset.symbol}</span>
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">
                          {asset.quantity.toFixed(4)}
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">
                          {asset.price_inr > 0 ? formatInr(asset.price_inr) : "—"}
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-800 dark:text-zinc-200 text-sm font-medium">
                          {asset.value_inr > 0 ? formatInr(asset.value_inr) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-3">
                No active balances.
              </div>
            )}
          </div>

          {/* Funding Wallet */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800 dark:text-white flex items-center gap-2">
                Funding Wallet
              </h3>
              {portfolio && fundingAssets.length > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  {formatInr(portfolio.funding.total_inr)}
                </span>
              )}
            </div>
            
            {fundingAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                      <th className="py-3 font-normal">Asset</th>
                      <th className="py-3 font-normal text-right">Qty</th>
                      <th className="py-3 font-normal text-right">Price (INR)</th>
                      <th className="py-3 font-normal text-right">Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundingAssets.map((asset) => (
                      <tr key={`funding-${asset.symbol}`} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-4 font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-500 dark:text-zinc-400 font-bold group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                            {asset.symbol.slice(0, 3)}
                          </div>
                          <span className="text-slate-700 dark:text-zinc-200">{asset.symbol}</span>
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">
                          {asset.quantity.toFixed(4)}
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">
                          {asset.price_inr > 0 ? formatInr(asset.price_inr) : "—"}
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-800 dark:text-zinc-200 text-sm font-medium">
                          {asset.value_inr > 0 ? formatInr(asset.value_inr) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-3">
                No active balances.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import ZerodhaLoginPrompt from "./ZerodhaLoginPrompt";
import { api, routes } from "../lib/api";
import {
  extractZerodhaApiError,
  isZerodhaApiError,
  isZerodhaHolding,
  isZerodhaMFHolding,
  type ZerodhaMFHolding,
  type ZerodhaHolding,
} from "../lib/zerodha";

type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

async function settle<T>(task: T): Promise<Settled<Awaited<T>>> {
  try {
    return { status: "fulfilled", value: await task };
  } catch (reason: unknown) {
    return { status: "rejected", reason };
  }
}

export default function ZerodhaHoldings() {
  const [holdings, setHoldings] = useState<ZerodhaHolding[]>([]);
  const [mfHoldings, setMfHoldings] = useState<ZerodhaMFHolding[]>([]);

  const [stocksErrorMsg, setStocksErrorMsg] = useState<string | null>(null);
  const [mfErrorMsg, setMfErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stocksRes = await settle(api.get(routes.zerodha.holdings));
        const mfRes = await settle(api.get(routes.zerodha.mfHoldings));

        // Stocks
        if (stocksRes.status === "fulfilled") {
          const data = stocksRes.value.data;
          if (isZerodhaApiError(data)) {
            setStocksErrorMsg(data.message);
          } else if (Array.isArray(data)) {
            setHoldings(data.filter(isZerodhaHolding));
            setStocksErrorMsg(null);
          } else {
            setStocksErrorMsg("Received an invalid Zerodha holdings response.");
          }
        } else {
          const zerodhaError = extractZerodhaApiError(stocksRes.reason);
          setStocksErrorMsg(zerodhaError?.message ?? "Failed to fetch Zerodha holdings");
        }

        // Mutual funds
        if (mfRes.status === "fulfilled") {
          const data = mfRes.value.data;
          if (isZerodhaApiError(data)) {
            setMfErrorMsg(data.message);
          } else if (Array.isArray(data)) {
            setMfHoldings(data.filter(isZerodhaMFHolding));
            setMfErrorMsg(null);
          } else {
            setMfErrorMsg("Received an invalid mutual fund holdings response.");
          }
        } else {
          const zerodhaError = extractZerodhaApiError(mfRes.reason);
          setMfErrorMsg(zerodhaError?.message ?? "Failed to fetch mutual fund holdings");
        }
      } catch (error: unknown) {
        const zerodhaError = extractZerodhaApiError(error);
        setStocksErrorMsg(zerodhaError?.message ?? "Failed to fetch Zerodha holdings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPnl =
    holdings.reduce((sum, h) => sum + h.pnl, 0) +
    mfHoldings.reduce((sum, h) => sum + h.pnl, 0);
  const isProfitable = totalPnl >= 0;

  // Show the login prompt when either data set failed to load
  const anyError = stocksErrorMsg ?? mfErrorMsg;
  const promptMsg = stocksErrorMsg ?? mfErrorMsg;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all hover:bg-white dark:hover:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700/50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Zerodha Holdings
        </h2>
        <span className="text-slate-400 dark:text-zinc-500 text-sm">
          {loading ? "Loading..." : `${holdings.length} Stocks · ${mfHoldings.length} Mutual Funds`}
        </span>
      </div>

      {/* Total P&L summary */}
      {!loading && !anyError && holdings.length + mfHoldings.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/30">
          <span className="text-slate-500 dark:text-zinc-400 text-sm">Total P&amp;L</span>
          <span className={`text-sm font-semibold tabular-nums ${isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {isProfitable ? "+" : ""}₹{totalPnl.toFixed(2)}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : anyError ? (
        <ZerodhaLoginPrompt message={promptMsg ?? "Zerodha session needs to be refreshed."} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Stocks */}
          {stocksErrorMsg && holdings.length === 0 && (
            <div className="text-red-500 dark:text-red-400 text-sm">{stocksErrorMsg}</div>
          )}
          {holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                    <th className="py-3 font-normal">Stock</th>
                    <th className="py-3 font-normal text-right">Qty</th>
                    <th className="py-3 font-normal text-right">Avg Price</th>
                    <th className="py-3 font-normal text-right">LTP</th>
                    <th className="py-3 font-normal text-right">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const profit = h.pnl >= 0;
                    const dayUp = h.day_change >= 0;
                    return (
                      <tr key={h.tradingsymbol} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-500 dark:text-zinc-400 font-bold group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                              {h.tradingsymbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-slate-700 dark:text-zinc-200 text-sm">{h.tradingsymbol}</p>
                              <p className="text-slate-400 dark:text-zinc-600 text-xs">{h.exchange}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right tabular-nums text-slate-700 dark:text-zinc-300 text-sm">{h.quantity}</td>
                        <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">₹{h.average_price.toFixed(2)}</td>
                        <td className="py-4 text-right tabular-nums text-slate-700 dark:text-zinc-200 text-sm">
                          <div>
                            <p>₹{h.last_price.toFixed(2)}</p>
                            <p className={`text-xs ${dayUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                              {dayUp ? "▲" : "▼"} {Math.abs(h.day_change_percentage).toFixed(2)}%
                            </p>
                          </div>
                        </td>
                        <td className={`py-4 text-right tabular-nums text-sm font-medium ${profit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          {profit ? "+" : ""}₹{h.pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : holdings.length === 0 && !stocksErrorMsg ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-3">
              No stock holdings found.
            </div>
          ) : null}

          {/* Mutual Funds */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white">Mutual Funds</h3>
            {mfErrorMsg && mfHoldings.length === 0 && (
              <div className="text-red-500 dark:text-red-400 text-sm">{mfErrorMsg}</div>
            )}
            {mfHoldings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                      <th className="py-3 font-normal">Fund</th>
                      <th className="py-3 font-normal text-right">Qty</th>
                      <th className="py-3 font-normal text-right">Avg Price</th>
                      <th className="py-3 font-normal text-right">LTP</th>
                      <th className="py-3 font-normal text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mfHoldings.map((mf) => {
                      const profit = mf.pnl >= 0;
                      return (
                        <tr key={`${mf.folio}-${mf.tradingsymbol}`} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group">
                          <td className="py-4 font-medium">
                            <div className="flex flex-col">
                              <p className="text-slate-700 dark:text-zinc-200 text-sm">{mf.fund}</p>
                              <p className="text-slate-400 dark:text-zinc-600 text-xs">{mf.tradingsymbol}</p>
                            </div>
                          </td>
                          <td className="py-4 text-right tabular-nums text-slate-700 dark:text-zinc-300 text-sm">{mf.quantity}</td>
                          <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">₹{mf.average_price.toFixed(2)}</td>
                          <td className="py-4 text-right tabular-nums text-slate-700 dark:text-zinc-200 text-sm">₹{mf.last_price.toFixed(2)}</td>
                          <td className={`py-4 text-right tabular-nums text-sm font-medium ${profit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                            {profit ? "+" : ""}₹{mf.pnl.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : !mfErrorMsg ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-3">
                No mutual fund holdings found.
              </div>
            ) : null}
          </div>

          {holdings.length === 0 && mfHoldings.length === 0 && !mfErrorMsg && !stocksErrorMsg && (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-12">
              No holdings found in Zerodha account.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import ZerodhaLoginPrompt from "./ZerodhaLoginPrompt";
import { api, routes } from "../lib/api";
import {
  extractZerodhaApiError,
  isZerodhaApiError,
  isZerodhaHolding,
  type ZerodhaHolding,
} from "../lib/zerodha";

export default function ZerodhaHoldings() {
  const [holdings, setHoldings] = useState<ZerodhaHolding[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(routes.zerodha.holdings);

        if (isZerodhaApiError(response.data)) {
          setErrorMsg(response.data.message);
          setLoginUrl(response.data.login_url ?? null);
          setAuthRequired(response.data.code === "AUTH_REQUIRED");
          return;
        }

        if (!Array.isArray(response.data)) {
          setErrorMsg("Received an invalid Zerodha holdings response.");
          setAuthRequired(false);
          return;
        }

        setHoldings(response.data.filter(isZerodhaHolding));
        setAuthRequired(false);
      } catch (error: unknown) {
        const zerodhaError = extractZerodhaApiError(error);

        if (zerodhaError) {
          setErrorMsg(zerodhaError.message);
          setLoginUrl(zerodhaError.login_url ?? null);
          setAuthRequired(zerodhaError.code === "AUTH_REQUIRED");
          return;
        }

        setErrorMsg("Failed to fetch Zerodha holdings");
        setAuthRequired(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const isProfitable = totalPnl >= 0;

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
          {loading ? "Loading..." : `${holdings.length} Stocks`}
        </span>
      </div>

      {/* Total P&L summary */}
      {!loading && !errorMsg && holdings.length > 0 && (
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
      ) : errorMsg ? (
        loginUrl || authRequired ? (
          <ZerodhaLoginPrompt
            message={errorMsg}
            loginUrl={loginUrl ?? undefined}
          />
        ) : (
          <div className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</div>
        )
      ) : holdings.length > 0 ? (
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
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-12">
          No holdings found in Zerodha account.
        </div>
      )}
    </div>
  );
}

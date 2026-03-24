"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface FundingBalance {
  asset: string;
  free: string;
  locked: string;
  btcValuation?: string;
}

export default function FundingWallet() {
  const [balances, setBalances] = useState<FundingBalance[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/get-data");
        const data = response.data;
        
        if (Array.isArray(data)) {
          const active = data
            .filter((b: FundingBalance) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
            .sort((a: FundingBalance, b: FundingBalance) => parseFloat(b.free) - parseFloat(a.free));
          
          setBalances(active);
        } else if (data && data.error) {
          setErrorMsg(data.error);
        }
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || "Failed to fetch from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Funding Wallet
        </h2>
        <span className="text-zinc-500 text-sm">
          {loading ? "Loading..." : `${balances.length} Assets`}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
           <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorMsg ? (
        <div className="text-red-400 text-sm">{errorMsg}</div>
      ) : balances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-sm">
                <th className="py-3 font-normal">Asset</th>
                <th className="py-3 font-normal text-right">Free</th>
                <th className="py-3 font-normal text-right">Locked</th>
                {balances.some((a) => parseFloat(a.btcValuation || "0") > 0) && (
                  <th className="py-3 font-normal text-right">BTC Val</th>
                )}
              </tr>
            </thead>
            <tbody>
              {balances.map((asset) => (
                <tr key={asset.asset} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                  <td className="py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold group-hover:bg-teal-500/20 group-hover:text-teal-300 transition-colors">
                      {asset.asset.slice(0, 3)}
                    </div>
                    {asset.asset}
                  </td>
                  <td className="py-4 text-right tabular-nums text-zinc-300">{parseFloat(asset.free).toFixed(4)}</td>
                  <td className="py-4 text-right tabular-nums text-zinc-500">{parseFloat(asset.locked).toFixed(4)}</td>
                  {parseFloat(asset.btcValuation || "0") > 0 && (
                    <td className="py-4 text-right tabular-nums text-yellow-500/80 text-sm">{asset.btcValuation}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm py-12">
          No active balances found in Funding Wallet.
        </div>
      )}
    </div>
  );
}

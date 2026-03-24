"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface AccountBalance {
  asset: string;
  free: string;
  locked: string;
}

export default function SpotAccount() {
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/account-info");
        const data = response.data;
        
        if (data && data.balances) {
          const active = data.balances
            .filter((b: AccountBalance) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
            .sort((a: AccountBalance, b: AccountBalance) => parseFloat(b.free) - parseFloat(a.free));
          
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
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Spot Account
        </h2>
        <span className="text-zinc-500 text-sm">
          {loading ? "Loading..." : `${balances.length} Assets`}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
              </tr>
            </thead>
            <tbody>
              {balances.map((asset) => (
                <tr key={asset.asset} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                  <td className="py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                      {asset.asset.slice(0, 3)}
                    </div>
                    {asset.asset}
                  </td>
                  <td className="py-4 text-right tabular-nums text-zinc-300">{parseFloat(asset.free).toFixed(4)}</td>
                  <td className="py-4 text-right tabular-nums text-zinc-500">{parseFloat(asset.locked).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm py-12">
          No active balances found in Spot Account.
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api, routes } from "../lib/api";
import ZerodhaLoginPrompt from "./ZerodhaLoginPrompt";
import {
  extractZerodhaApiError,
  isZerodhaApiError,
  isZerodhaMFSip,
  type ZerodhaMFSip,
} from "../lib/zerodha";

type SipFilter = "all" | "ACTIVE" | "PAUSED";

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function MutualFundSips() {
  const [filter, setFilter] = useState<SipFilter>("all");
  const [sips, setSips] = useState<ZerodhaMFSip[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSips = async () => {
      setLoading(true);
      try {
        const response = await api.get(routes.zerodha.mfSips);

        if (isZerodhaApiError(response.data)) {
          setErrorMsg(response.data.message);
          return;
        }

        if (!Array.isArray(response.data)) {
          setErrorMsg("Received an invalid mutual fund SIPs response.");
          return;
        }

        setSips(response.data.filter(isZerodhaMFSip));
        setErrorMsg(null);
      } catch (error: unknown) {
        const zerodhaError = extractZerodhaApiError(error);
        setErrorMsg(zerodhaError?.message ?? "Failed to fetch mutual fund SIPs");
      } finally {
        setLoading(false);
      }
    };

    fetchSips();
  }, []);

  const visibleSips = useMemo(() => {
    if (filter === "all") return sips;
    return sips.filter((s) => s.status === filter);
  }, [filter, sips]);

  const counts = useMemo(() => {
    const active = sips.filter((s) => s.status === "ACTIVE").length;
    const paused = sips.filter((s) => s.status === "PAUSED").length;
    return { active, paused, total: sips.length };
  }, [sips]);

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm dark:shadow-none transition-all">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16M7 4v16M17 4v16" />
          </svg>
          Mutual Fund SIPs
        </h2>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 w-fit">
          {([
            { value: "all" as const, label: `All (${counts.total})` },
            { value: "ACTIVE" as const, label: `Active (${counts.active})` },
            { value: "PAUSED" as const, label: `Paused (${counts.paused})` },
          ] as const).map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === btn.value
                  ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMsg ? (
        <ZerodhaLoginPrompt message={errorMsg} />
      ) : visibleSips.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                <th className="py-3 font-normal">Fund</th>
                <th className="py-3 font-normal">Symbol</th>
                <th className="py-3 font-normal text-right">Status</th>
                <th className="py-3 font-normal text-right">Frequency</th>
                <th className="py-3 font-normal text-right">Next instalment</th>
                <th className="py-3 font-normal text-right">Last instalment</th>
                <th className="py-3 font-normal text-right">Installment amount</th>
                <th className="py-3 font-normal text-right">Completed</th>
                <th className="py-3 font-normal text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              {visibleSips.map((sip) => (
                <tr
                  key={sip.sip_id}
                  className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group"
                >
                  <td className="py-4 font-medium">
                    <div className="flex flex-col">
                      <p className="text-slate-700 dark:text-zinc-200 text-sm">{sip.fund}</p>
                      <p className="text-slate-400 dark:text-zinc-600 text-xs">
                        SIP: {sip.sip_id.slice(0, 8)}…
                      </p>
                    </div>
                  </td>
                  <td className="py-4 text-slate-700 dark:text-zinc-200 text-sm">{sip.tradingsymbol}</td>
                  <td className="py-4 text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        sip.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {sip.status}
                    </span>
                  </td>
                  <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">{sip.frequency}</td>
                  <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">{formatDate(sip.next_instalment)}</td>
                  <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">{formatDate(sip.last_instalment)}</td>
                  <td className="py-4 text-right tabular-nums text-slate-800 dark:text-zinc-200 text-sm font-medium">
                    ₹{sip.instalment_amount.toFixed(2)}
                  </td>
                  <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">{sip.completed_instalments}</td>
                  <td className="py-4 text-right tabular-nums text-slate-500 dark:text-zinc-400 text-sm">{sip.pending_instalments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && !errorMsg && visibleSips.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm py-12">
          No mutual fund SIPs found for the selected filter.
        </div>
      ) : null}
    </div>
  );
}


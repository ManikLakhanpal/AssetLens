"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import SpotAccount from "./components/SpotAccount";
import FundingWallet from "./components/FundingWallet";
import ZerodhaProfile from "./components/ZerodhaProfile";
import ZerodhaHoldings from "./components/ZerodhaHoldings";
import PortfolioPieChart from "./components/PortfolioPieChart";

type Filter = "all" | "binance" | "zerodha";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "binance", label: "Binance" },
  { value: "zerodha", label: "Zerodha" },
];

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const showBinance = activeFilter === "all" || activeFilter === "binance";
  const showZerodha = activeFilter === "all" || activeFilter === "zerodha";

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050511] text-slate-900 dark:text-zinc-100 selection:bg-teal-500/30 font-sans overflow-hidden transition-colors duration-200">
      {/* Background Gradients — dark mode only */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-80 blur-[80px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent opacity-70 blur-[80px] pointer-events-none" />
      <div className="hidden dark:block absolute top-[50%] left-[60%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent opacity-60 blur-[100px] pointer-events-none" />
      {/* Light mode gradient */}
      <div className="block dark:hidden absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-12">
        <Header />

        {/* Exchange Filter Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/50 w-fit">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === value
                  ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700/50"
                  : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Portfolio Pie Chart — full width */}
        <PortfolioPieChart />

        {/* Binance Section */}
        {showBinance && (
          <section className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600 font-medium pl-1">Binance</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpotAccount />
              <FundingWallet />
            </div>
          </section>
        )}

        {/* Zerodha Section */}
        {showZerodha && (
          <section className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600 font-medium pl-1">Zerodha</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ZerodhaProfile />
              <ZerodhaHoldings />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

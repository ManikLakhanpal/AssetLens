import React from "react";
import Header from "./components/Header";
import SpotAccount from "./components/SpotAccount";
import FundingWallet from "./components/FundingWallet";
import ZerodhaProfile from "./components/ZerodhaProfile";
import ZerodhaHoldings from "./components/ZerodhaHoldings";

export default function Dashboard() {
  return (
    <div className="relative min-h-screen bg-[#050511] text-zinc-100 selection:bg-teal-500/30 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-80 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent opacity-70 blur-[80px] pointer-events-none" />
      <div className="absolute top-[50%] left-[60%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent opacity-60 blur-[100px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-12">
        <Header />

        {/* Binance */}
        <section className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium pl-1">Binance</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SpotAccount />
            <FundingWallet />
          </div>
        </section>

        {/* Zerodha */}
        <section className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium pl-1">Zerodha</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ZerodhaProfile />
            <ZerodhaHoldings />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 mb-3">
          Portfolio Overview
        </h1>
        <p className="text-zinc-400 text-lg">
          Manage and track your Binance & Zerodha assets with precision.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-medium shadow-[0_0_15px_rgba(20,184,166,0.15)]">
           <span className="w-2 h-2 rounded-full bg-teal-400 mr-2 animate-pulse" />
           Binance Connected
        </span>
        <span className="flex items-center justify-center px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500 text-sm font-medium">
           Zerodha (Coming Soon)
        </span>
      </div>
    </header>
  );
}

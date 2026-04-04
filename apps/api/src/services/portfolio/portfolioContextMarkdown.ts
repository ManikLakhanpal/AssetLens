import type { PortfolioSummary, AssetSlice } from "./portfolioSummaryService";
import type { BinancePortfolioInr, BinanceAssetInr } from "../binance/binanceInrService";

type ZerodhaServiceError = { success: false; message: string; code?: string };

function isZerodhaError(v: unknown): v is ZerodhaServiceError {
  return (
    typeof v === "object" &&
    v !== null &&
    "success" in v &&
    (v as { success: unknown }).success === false &&
    typeof (v as { message?: unknown }).message === "string"
  );
}

function fmtInr(n: number): string {
  return `₹${n.toFixed(2)}`;
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, " ").replace(/\r?\n/g, " ");
}

function binanceRows(assets: BinanceAssetInr[]): string {
  if (assets.length === 0) return "_No positions._\n";
  const header = "| Symbol | Qty | Price (INR) | Value (INR) |\n| --- | ---: | ---: | ---: |\n";
  const body = assets
    .map(
      (a) =>
        `| ${escapeCell(a.symbol)} | ${a.quantity} | ${fmtInr(a.price_inr)} | ${fmtInr(a.value_inr)} |`
    )
    .join("\n");
  return header + body + "\n";
}

/** Snapshot shape produced by collectPortfolioSnapshot() */
export type PortfolioSnapshotInput = {
  portfolioSummary?: PortfolioSummary;
  portfolioAssets?: { assets: AssetSlice[]; total_inr: number };
  zerodhaProfile: unknown;
  zerodhaHoldings: unknown;
  mfHoldings: unknown;
  mfSips: unknown;
  binancePortfolio?: BinancePortfolioInr;
};

export function buildPortfolioContextMarkdown(snapshot: PortfolioSnapshotInput): string {
  const parts: string[] = [];
  parts.push("## Portfolio context (dashboard snapshot)");
  parts.push(
    "_Data below matches what the AssetLens dashboard aggregates. Use it as the source of truth for holdings, quantities, and values._\n"
  );

  // —— Exchange totals (stocks + crypto pie; MF added where we compute) ——
  const { portfolioSummary, portfolioAssets } = snapshot;
  let mfTotalInr = 0;
  if (!isZerodhaError(snapshot.mfHoldings) && Array.isArray(snapshot.mfHoldings)) {
    for (const mf of snapshot.mfHoldings as Array<{ quantity: number; last_price: number }>) {
      mfTotalInr += mf.quantity * mf.last_price;
    }
  }

  if (portfolioSummary) {
    parts.push("### Exchange totals (INR)");
    parts.push(
      `| | **Binance (crypto)** | **Zerodha (stocks)** | **Combined (excl. MF in pie)** |\n| --- | ---: | ---: | ---: |\n| Total | ${fmtInr(portfolioSummary.binance_inr)} | ${fmtInr(portfolioSummary.zerodha_inr)} | ${fmtInr(portfolioSummary.total_inr)} |\n`
    );
    parts.push(
      `**Mutual funds (holdings) estimated value:** ${fmtInr(mfTotalInr)} (qty × last price; same basis as dashboard pie when MF slice is included.)\n`
    );
  } else {
    parts.push("### Exchange totals (INR)\n_Unavailable (failed to load summary)._\n");
  }

  if (portfolioAssets?.assets?.length) {
    parts.push("### Per-asset slices (Binance + Zerodha stocks, > ₹10)");
    parts.push(`**Total (this slice set):** ${fmtInr(portfolioAssets.total_inr)}\n`);
    parts.push("| Asset | Exchange | Value (INR) |\n| --- | --- | ---: |\n");
    for (const a of portfolioAssets.assets) {
      parts.push(`| ${escapeCell(a.name)} | ${a.exchange} | ${fmtInr(a.value)} |\n`);
    }
    parts.push("");
  } else if (portfolioAssets) {
    parts.push("### Per-asset slices\n_No assets above ₹10 threshold._\n");
  }

  // —— Zerodha profile ——
  const zp = snapshot.zerodhaProfile;
  if (isZerodhaError(zp)) {
    parts.push("### Zerodha profile\n");
    parts.push(`_Unavailable:_ ${zp.message}\n`);
  } else if (zp && typeof zp === "object" && "user_id" in zp) {
    const p = zp as Record<string, unknown>;
    parts.push("### Zerodha profile");
    parts.push(
      `- **User:** ${String(p.user_name ?? "—")} (${String(p.user_id ?? "—")})\n` +
        `- **Email:** ${String(p.email ?? "—")}\n` +
        `- **Broker:** ${String(p.broker ?? "—")}\n`
    );
    if (Array.isArray(p.exchanges)) {
      parts.push(`- **Exchanges:** ${p.exchanges.join(", ")}\n`);
    }
    parts.push("");
  } else {
    parts.push("### Zerodha profile\n_Unknown or missing._\n");
  }

  // —— Zerodha equities ——
  const zh = snapshot.zerodhaHoldings;
  if (isZerodhaError(zh)) {
    parts.push("### Zerodha stock holdings\n");
    parts.push(`_Unavailable:_ ${zh.message}\n`);
  } else if (Array.isArray(zh) && zh.length > 0) {
    parts.push("### Zerodha stock holdings");
    parts.push(
      "| Symbol | Exchange | Qty | Avg | LTP | P&L | Day % |\n| --- | --- | ---: | ---: | ---: | ---: | ---: |\n"
    );
    for (const h of zh as Array<Record<string, unknown>>) {
      const dayPct = Number(h.day_change_percentage);
      const dayStr = Number.isFinite(dayPct) ? `${dayPct.toFixed(2)}%` : "—";
      parts.push(
        `| ${escapeCell(String(h.tradingsymbol ?? ""))} | ${escapeCell(String(h.exchange ?? ""))} | ${Number(h.quantity)} | ${fmtInr(Number(h.average_price))} | ${fmtInr(Number(h.last_price))} | ${fmtInr(Number(h.pnl))} | ${dayStr} |\n`
      );
    }
    parts.push("");
  } else {
    parts.push("### Zerodha stock holdings\n_No equity positions or empty._\n");
  }

  // —— MF holdings ——
  const mf = snapshot.mfHoldings;
  if (isZerodhaError(mf)) {
    parts.push("### Mutual fund holdings\n");
    parts.push(`_Unavailable:_ ${mf.message}\n`);
  } else if (Array.isArray(mf) && mf.length > 0) {
    parts.push("### Mutual fund holdings");
    parts.push(
      "| Fund | ISIN/Symbol | Folio | Qty | Avg | LTP | P&L | XIRR |\n| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |\n"
    );
    for (const row of mf as Array<Record<string, unknown>>) {
      const xirr = Number(row.xirr);
      const xirrStr = Number.isFinite(xirr) ? `${xirr.toFixed(2)}%` : "—";
      parts.push(
        `| ${escapeCell(String(row.fund ?? ""))} | ${escapeCell(String(row.tradingsymbol ?? ""))} | ${escapeCell(String(row.folio ?? ""))} | ${Number(row.quantity)} | ${fmtInr(Number(row.average_price))} | ${fmtInr(Number(row.last_price))} | ${fmtInr(Number(row.pnl))} | ${xirrStr} |\n`
      );
    }
    parts.push("");
  } else {
    parts.push("### Mutual fund holdings\n_No MF positions or empty._\n");
  }

  // —— MF SIPs ——
  const sips = snapshot.mfSips;
  if (isZerodhaError(sips)) {
    parts.push("### Mutual fund SIPs\n");
    parts.push(`_Unavailable:_ ${sips.message}\n`);
  } else if (Array.isArray(sips) && sips.length > 0) {
    parts.push("### Mutual fund SIPs");
    parts.push(
      "| Fund | Symbol | Status | Amount | Frequency | Next | Pending | Completed |\n| --- | --- | --- | ---: | --- | --- | ---: | ---: |\n"
    );
    for (const s of sips as Array<Record<string, unknown>>) {
      parts.push(
        `| ${escapeCell(String(s.fund ?? ""))} | ${escapeCell(String(s.tradingsymbol ?? ""))} | ${String(s.status ?? "")} | ${fmtInr(Number(s.instalment_amount))} | ${String(s.frequency ?? "")} | ${String(s.next_instalment ?? "")} | ${Number(s.pending_instalments)} | ${Number(s.completed_instalments)} |\n`
      );
    }
    parts.push("");
  } else {
    parts.push("### Mutual fund SIPs\n_No SIPs or empty._\n");
  }

  // —— Binance ——
  const b = snapshot.binancePortfolio;
  if (!b) {
    parts.push("### Binance (crypto)\n_Unavailable (failed to load or not connected)._");
  } else {
    parts.push("### Binance (crypto)");
    parts.push(`**Combined total (INR):** ${fmtInr(b.total_inr)}\n`);
    parts.push(`**Funding wallet total (INR):** ${fmtInr(b.funding.total_inr)}\n`);
    parts.push(`**Spot wallet total (INR):** ${fmtInr(b.spot.total_inr)}\n`);
    parts.push("\n#### Combined balances\n");
    parts.push(binanceRows(b.assets));
    parts.push("#### Funding wallet\n");
    parts.push(binanceRows(b.funding.assets));
    parts.push("#### Spot wallet\n");
    parts.push(binanceRows(b.spot.assets));
  }

  return parts.join("\n");
}

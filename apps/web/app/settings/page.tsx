"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, routes } from "../lib/api";
import AuthGuard from "../components/AuthGuard";

type MeResponse = {
  id: string;
  username: string;
  createdAt: string;
  hasBinance: boolean;
  hasZerodha: boolean;
};

// --- Reusable field component ---
function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-500"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition"
      />
    </div>
  );
}

// --- Status badge ---
function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
      Configured
    </span>
  ) : (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 text-slate-400 dark:text-zinc-500 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
      Not set
    </span>
  );
}

// --- Credential section ---
function CredentialSection({
  title,
  configured,
  apiKey,
  apiSecret,
  onApiKeyChange,
  onApiSecretChange,
  onSave,
  saving,
  saved,
  error,
}: {
  title: string;
  configured: boolean;
  apiKey: string;
  apiSecret: string;
  onApiKeyChange: (v: string) => void;
  onApiSecretChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/50">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{title}</h2>
        <StatusBadge configured={configured} />
      </div>

      <Field
        id={`${title.toLowerCase()}-api-key`}
        label="API Key"
        value={apiKey}
        onChange={onApiKeyChange}
        placeholder={configured ? "Enter new key to update" : "Your API key"}
      />
      <Field
        id={`${title.toLowerCase()}-api-secret`}
        label="API Secret"
        type="password"
        value={apiSecret}
        onChange={onApiSecretChange}
        placeholder={configured ? "Enter new secret to update" : "Your API secret"}
      />

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="text-xs text-teal-600 dark:text-teal-400">Credentials saved successfully.</p>
      )}

      <button
        onClick={onSave}
        disabled={saving || !apiKey.trim() || !apiSecret.trim()}
        className="self-start px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-150 shadow-[0_0_16px_rgba(20,184,166,0.25)]"
      >
        {saving ? "Saving…" : configured ? "Update" : "Save"}
      </button>
    </div>
  );
}

// --- Main page ---
export default function SettingsPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Binance state
  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [binanceSaving, setBinanceSaving] = useState(false);
  const [binanceSaved, setBinanceSaved] = useState(false);
  const [binanceError, setBinanceError] = useState("");

  // Zerodha state
  const [zerodhaKey, setZerodhaKey] = useState("");
  const [zerodhaSecret, setZerodhaSecret] = useState("");
  const [zerodhaSaving, setZerodhaSaving] = useState(false);
  const [zerodhaSaved, setZerodhaSaved] = useState(false);
  const [zerodhaError, setZerodhaError] = useState("");

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get<MeResponse>(routes.auth.me);
      setMe(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  async function saveBinance() {
    setBinanceSaving(true);
    setBinanceSaved(false);
    setBinanceError("");
    try {
      await api.put(routes.auth.credentials, {
        binance: { apiKey: binanceKey.trim(), apiSecret: binanceSecret.trim() },
      });
      setBinanceSaved(true);
      setBinanceKey("");
      setBinanceSecret("");
      setMe((prev) => prev ? { ...prev, hasBinance: true } : prev);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Failed to save Binance credentials.";
      setBinanceError(msg);
    } finally {
      setBinanceSaving(false);
    }
  }

  async function saveZerodha() {
    setZerodhaSaving(true);
    setZerodhaSaved(false);
    setZerodhaError("");
    try {
      await api.put(routes.auth.credentials, {
        zerodha: { apiKey: zerodhaKey.trim(), apiSecret: zerodhaSecret.trim() },
      });
      setZerodhaSaved(true);
      setZerodhaKey("");
      setZerodhaSecret("");
      setMe((prev) => prev ? { ...prev, hasZerodha: true } : prev);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Failed to save Zerodha credentials.";
      setZerodhaError(msg);
    } finally {
      setZerodhaSaving(false);
    }
  }

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-white dark:bg-[#050511] text-slate-900 dark:text-zinc-100 overflow-hidden">
        {/* Background gradients */}
        <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-80 blur-[80px] pointer-events-none" />
        <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent opacity-70 blur-[80px] pointer-events-none" />
        <div className="block dark:hidden absolute top-0 left-0 w-full h-64 bg-linear-to-b from-slate-50 to-transparent pointer-events-none" />

        <main className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-8">
          {/* Header row */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Dashboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400 dark:from-white dark:to-zinc-500">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Manage your profile and API credentials.
            </p>
          </div>

          {/* Profile section */}
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/50">
            <h2 className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Profile
            </h2>
            {loading ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">Loading…</p>
            ) : me ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm select-none">
                    {me.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{me.username}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      Member since {new Date(me.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">Could not load profile.</p>
            )}
          </div>

          {/* Binance credentials */}
          <CredentialSection
            title="Binance"
            configured={me?.hasBinance ?? false}
            apiKey={binanceKey}
            apiSecret={binanceSecret}
            onApiKeyChange={setBinanceKey}
            onApiSecretChange={setBinanceSecret}
            onSave={saveBinance}
            saving={binanceSaving}
            saved={binanceSaved}
            error={binanceError}
          />

          {/* Zerodha credentials */}
          <CredentialSection
            title="Zerodha"
            configured={me?.hasZerodha ?? false}
            apiKey={zerodhaKey}
            apiSecret={zerodhaSecret}
            onApiKeyChange={setZerodhaKey}
            onApiSecretChange={setZerodhaSecret}
            onSave={saveZerodha}
            saving={zerodhaSaving}
            saved={zerodhaSaved}
            error={zerodhaError}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
